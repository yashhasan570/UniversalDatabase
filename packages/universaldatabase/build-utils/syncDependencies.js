const path = require('path');
const fs = require('fs').promises;
const semver = require('semver');

/**
 * Synchronizes dependencies between universaldatabase and integration packages
 *
 * @param {Object} options - Sync options
 * @param {boolean} options.bidirectional - Whether to sync in both directions (default: true)
 * @param {string} options.direction - Direction of sync: 'normal' (integrations → universaldatabase) or 'reverse' (universaldatabase → integrations)
 * @returns {Promise<void>}
 */
async function syncDependencies(
  options = { bidirectional: true, direction: 'normal' },
) {
  console.log(
    'Syncing dependencies between universaldatabase and integration packages...',
  );

  // Set defaults
  options = {
    bidirectional: true,
    direction: 'normal',
    ...options,
  };

  // If direction is 'reverse', we're only doing universaldatabase → integrations
  const syncIntegrationsToNocodb =
    options.bidirectional || options.direction === 'normal';
  const syncNocodbToIntegrations =
    options.bidirectional || options.direction === 'reverse';

  // Read the universaldatabase package.json
  const universaldatabasePackageJsonPath = path.join(__dirname, '..', 'package.json');
  const universaldatabasePackageJson = JSON.parse(
    await fs.readFile(universaldatabasePackageJsonPath, 'utf-8'),
  );

  // Collect all dependencies and their versions from universaldatabase
  const universaldatabaseDeps = {
    ...(universaldatabasePackageJson.dependencies || {}),
    ...(universaldatabasePackageJson.devDependencies || {}),
  };

  // Track dependencies to be added or updated
  const depsToUpdate = {};
  const depsToAdd = {};
  const integrationDepsMap = {};

  // Track integrations to update if bidirectional
  const integrationsToUpdate = new Map();

  // Find local integrations
  try {
    const localIntegrationsPath = path.join(
      __dirname,
      '..',
      '..',
      'universaldatabase-integrations',
      'packages',
    );

    const localIntegrationDirs = await fs.readdir(localIntegrationsPath, {
      withFileTypes: true,
    });

    // First pass: gather all integration dependencies
    for (const dirent of localIntegrationDirs) {
      if (!dirent.isDirectory() || dirent.name === 'core') continue;

      const integrationName = dirent.name;
      const integrationPackageJsonPath = path.join(
        localIntegrationsPath,
        integrationName,
        'package.json',
      );

      const integrationPackageJson = JSON.parse(
        await fs.readFile(integrationPackageJsonPath, 'utf-8'),
      );

      // Store the integration package json for updates
      if (syncNocodbToIntegrations) {
        integrationsToUpdate.set(integrationName, {
          path: integrationPackageJsonPath,
          json: integrationPackageJson,
          changed: false,
        });
      }

      // Only process dependencies from integrations if we're syncing that direction
      if (syncIntegrationsToNocodb) {
        // Process dependencies from this integration
        const dependencies = integrationPackageJson.dependencies || {};

        for (const [dep, version] of Object.entries(dependencies)) {
          // Skip workspace dependencies and universaldatabase-integrations
          if (
            version === 'workspace:*' ||
            dep.startsWith('@universaldatabase-integrations/')
          ) {
            continue;
          }

          // Track which integrations use each dependency
          if (!integrationDepsMap[dep]) {
            integrationDepsMap[dep] = [];
          }
          integrationDepsMap[dep].push({
            integration: integrationName,
            version,
          });

          if (!universaldatabaseDeps[dep]) {
            // This is a new dependency to add
            depsToAdd[dep] = version;
          } else if (universaldatabaseDeps[dep] !== version) {
            // This dependency exists but with a different version
            // Determine which version is newer
            try {
              // Handle non-semver versions like git urls or local paths
              if (
                !version.startsWith('^') &&
                !version.startsWith('~') &&
                !semver.valid(semver.clean(version))
              ) {
                // For non-standard versions, prefer the integration version if flagged for update
                if (depsToUpdate[dep]) {
                  console.log(
                    `Warning: Non-standard version for ${dep}: ${version}, keeping existing`,
                  );
                }
                continue;
              }

              const currentVersion = universaldatabaseDeps[dep].replace(/[\^~]/, '');
              const newVersion = version.replace(/[\^~]/, '');

              if (semver.gt(newVersion, currentVersion)) {
                depsToUpdate[dep] = version;
                console.log(
                  `Updating ${dep}: ${universaldatabaseDeps[dep]} → ${version} (from ${integrationName})`,
                );
              }
            } catch (e) {
              console.log(
                `Warning: Unable to compare versions for ${dep}: ${e.message}`,
              );
            }
          }
        }
      }
    }

    let hasChanges = false;

    // First direction: Integrations → UniversalDatabase
    if (syncIntegrationsToNocodb) {
      console.log('\nSyncing from integrations to universaldatabase...');

      // Add new dependencies
      for (const [dep, version] of Object.entries(depsToAdd)) {
        console.log(
          `Adding new dependency ${dep}@${version} to universaldatabase, used by: ${integrationDepsMap[
            dep
          ]
            .map((d) => d.integration)
            .join(', ')}`,
        );
        universaldatabasePackageJson.dependencies[dep] = version;
        hasChanges = true;
      }

      // Update existing dependencies
      for (const [dep, version] of Object.entries(depsToUpdate)) {
        const usedBy = integrationDepsMap[dep]
          .map((d) => d.integration)
          .join(', ');

        // Check if it's in dependencies or devDependencies
        if (
          universaldatabasePackageJson.dependencies &&
          universaldatabasePackageJson.dependencies[dep]
        ) {
          universaldatabasePackageJson.dependencies[dep] = version;
          console.log(
            `Updated dependency ${dep}@${version} in universaldatabase, used by: ${usedBy}`,
          );
          hasChanges = true;
        } else if (
          universaldatabasePackageJson.devDependencies &&
          universaldatabasePackageJson.devDependencies[dep]
        ) {
          universaldatabasePackageJson.devDependencies[dep] = version;
          console.log(
            `Updated devDependency ${dep}@${version} in universaldatabase, used by: ${usedBy}`,
          );
          hasChanges = true;
        }
      }

      // Sort dependencies alphabetically
      if (universaldatabasePackageJson.dependencies) {
        universaldatabasePackageJson.dependencies = Object.fromEntries(
          Object.entries(universaldatabasePackageJson.dependencies).sort((a, b) =>
            a[0].localeCompare(b[0]),
          ),
        );
      }

      if (universaldatabasePackageJson.devDependencies) {
        universaldatabasePackageJson.devDependencies = Object.fromEntries(
          Object.entries(universaldatabasePackageJson.devDependencies).sort((a, b) =>
            a[0].localeCompare(b[0]),
          ),
        );
      }

      // Write back the updated package.json if there were changes
      if (hasChanges) {
        await fs.writeFile(
          universaldatabasePackageJsonPath,
          JSON.stringify(universaldatabasePackageJson, null, 2),
        );
        console.log(
          'Updated universaldatabase package.json with synchronized dependencies',
        );
      } else {
        console.log('No dependency changes needed for universaldatabase');
      }
    }

    let integrationUpdates = 0;

    // Second direction: UniversalDatabase → Integrations
    if (syncNocodbToIntegrations) {
      console.log('\nSyncing from universaldatabase to integration packages...');

      // Update dependencies in universaldatabase if we didn't already do it
      if (!syncIntegrationsToNocodb && hasChanges) {
        const updatedNocodb = JSON.parse(
          await fs.readFile(universaldatabasePackageJsonPath, 'utf-8'),
        );
        Object.assign(
          universaldatabaseDeps,
          updatedNocodb.dependencies || {},
          updatedNocodb.devDependencies || {},
        );
      }

      // Now update all integrations based on universaldatabase dependencies
      for (const [integrationName, integration] of integrationsToUpdate) {
        const integrationPackageJson = integration.json;
        let integrationChanged = false;

        // Update integration dependencies based on universaldatabase
        for (const [dep, version] of Object.entries(
          integrationPackageJson.dependencies || {},
        )) {
          // Skip workspace dependencies and universaldatabase-integrations
          if (
            version === 'workspace:*' ||
            dep.startsWith('@universaldatabase-integrations/')
          ) {
            continue;
          }

          // If universaldatabase has this dependency, check if we need to update
          if (universaldatabaseDeps[dep] && universaldatabaseDeps[dep] !== version) {
            try {
              // Handle non-semver versions
              if (
                !universaldatabaseDeps[dep].startsWith('^') &&
                !universaldatabaseDeps[dep].startsWith('~') &&
                !semver.valid(semver.clean(universaldatabaseDeps[dep]))
              ) {
                console.log(
                  `Warning: Skipping non-standard version for ${dep}: ${universaldatabaseDeps[dep]}`,
                );
                continue;
              }

              // Update integration dependency to match universaldatabase
              console.log(
                `Updating ${dep} in ${integrationName}: ${version} → ${universaldatabaseDeps[dep]}`,
              );
              integrationPackageJson.dependencies[dep] = universaldatabaseDeps[dep];
              integrationChanged = true;
            } catch (e) {
              console.log(
                `Warning: Unable to update version for ${dep} in ${integrationName}: ${e.message}`,
              );
            }
          }
        }

        // Sort dependencies alphabetically
        if (integrationPackageJson.dependencies) {
          integrationPackageJson.dependencies = Object.fromEntries(
            Object.entries(integrationPackageJson.dependencies).sort((a, b) =>
              a[0].localeCompare(b[0]),
            ),
          );
        }

        // Save changes if necessary
        if (integrationChanged) {
          await fs.writeFile(
            integration.path,
            JSON.stringify(integrationPackageJson, null, 2),
          );
          console.log(`Updated dependencies in ${integrationName}`);
          integrationUpdates++;
        }
      }

      if (integrationUpdates > 0) {
        console.log(
          `\nUpdated dependencies in ${integrationUpdates} integration packages`,
        );
      } else {
        console.log('\nNo integration packages needed dependency updates');
      }
    }

    if (hasChanges || integrationUpdates > 0) {
      console.log('\nPlease run `pnpm install` to update the dependencies');
    }
  } catch (e) {
    console.error('Error syncing dependencies:', e);
  }
}

// Run the sync function if this script is called directly
if (require.main === module) {
  // Check for command line options
  const options = {
    bidirectional:
      !process.argv.includes('--one-way') &&
      !process.argv.includes('--reverse'),
    direction: process.argv.includes('--reverse') ? 'reverse' : 'normal',
  };

  syncDependencies(options);
}

module.exports = { syncDependencies };
