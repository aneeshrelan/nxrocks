import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

jest.mock('inquirer'); // we mock 'inquirer' to bypass the interactive prompt
import * as inquirer from 'inquirer';

xdescribe('nx-flutter e2e', () => {

  beforeEach(() => {
    jest.spyOn(inquirer, 'prompt').mockResolvedValue({
      platforms: ['android', 'ios', 'web', 'linux', 'windows', 'macos'],
      androidLanguage: 'kotlin',
      iosLanguage: 'swift'
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create nx-flutter project with default options', async() => {
    const appName = uniq('nx-flutter');
    ensureNxProject('@nxrocks/nx-flutter', 'dist/packages/nx-flutter');
    await runNxCommandAsync(`generate @nxrocks/nx-flutter:create ${appName} --interactive=false`);

    const executors = [
      { name: 'analyze', output: `Analyzing ${appName}` },

      //{ name: 'assemble', output: `Assembling ${appName}` },
      //{ name: 'attach', output: `Attaching ${appName}` },

      //build commands
      { name: 'buildAar', output: `Running Gradle task 'assembleAarDebug'...` },
      { name: 'buildApk', output: `Built build/app/outputs/flutter-apk/app-release.apk` },
      { name: 'buildAppbundle', output: `Built build/app/outputs/bundle/release/app-release.aab` },
      { name: 'buildBundle', output: `Done in` },

      //required an iOS certificate
      //{name: 'buildIos', output: `No valid code signing certificates were found`},
      //{name: 'buildIosFramework', output: `Building frameworks for iOS is only supported from a module`},
      //{name: 'buildIpa', output: `No valid code signing certificates were found`},

      { name: 'clean', output: `Deleting flutter_export_environment.sh...` },

      //required a test file under 'test_driver/main_test.dart' (default)
      //{ name: 'drive', output: `xxx` },

      { name: 'format', output: `Done in ` },

      //required arb files under 'lib/l10n'
      //{ name: 'genL10n', output: `The 'arb-dir' directory, 'LocalDirectory: 'lib/l10n'', does not exist` },

      //required a running device
      //{ name: 'install', output: `No target device found` },
      //{ name: 'run', output: `No target device found` },

      { name: 'test', output: `All tests passed!` },
    ];

    for (const executor of executors) {
      const result = await runNxCommandAsync(`run ${appName}:${executor.name}`);
      expect(result.stdout).toContain(executor.output);
    }

    expect(() =>
      checkFilesExist(`apps/${appName}/pubspec.yaml`)
    ).not.toThrow();
  }, 200000);

  it('should create nx-flutter project with given options', async() => {
    const appName = uniq('nx-flutter');
    const org = 'com.tinesoft';
    const description = 'My flutter application';
    const androidLanguage = 'java';
    const iosLanguage = 'swift';
    const template = 'app';
    const platforms = 'android,ios,linux,macos,windows,web';
    const pub = true;
    const offline = true;

    ensureNxProject('@nxrocks/nx-flutter', 'dist/packages/nx-flutter');
    await runNxCommandAsync(`generate @nxrocks/nx-flutter:create ${appName} --interactive=false --org=${org} --description="${description}" --androidLanguage=${androidLanguage} --iosLanguage=${iosLanguage} --template=${template} --platforms="${platforms}" --pub=${pub} --offline=${offline} `);

    const executors = [

      { name: 'clean', output: `Deleting flutter_export_environment.sh...` },
      { name: 'format', output: `Done in ` },
      { name: 'test', output: `All tests passed!` },
    ];

    for (const executor of executors) {
      const result = await runNxCommandAsync(`run ${appName}:${executor.name}`);
      expect(result.stdout).toContain(executor.output);
    }

    expect(() =>
      checkFilesExist(`apps/${appName}/pubspec.yaml`,
        `apps/${appName}/android/build.gradle`,
        `apps/${appName}/ios/Runner.xcodeproj`,
        `apps/${appName}/android/app/src/main/java/com/tinesoft/${appName.replace('-', '_')}/MainActivity.java`
      )
    ).not.toThrow();
  }, 200000);

  describe('--directory', () => {
    it('should create src in the specified directory', async() => {
      const appName = uniq('nx-flutter');
      ensureNxProject('@nxrocks/nx-flutter', 'dist/packages/nx-flutter');
      await runNxCommandAsync(
        `generate @nxrocks/nx-flutter:create ${appName} --interactive=false --directory subdir`
      );
      expect(() =>
        checkFilesExist(`apps/subdir/${appName}/pubspec.yaml`)
      ).not.toThrow();
      }, 200000);
  });

  describe('--tags', () => {
    it('should add tags to nx.json', async() => {
      const appName = uniq('nx-flutter');
      ensureNxProject('@nxrocks/nx-flutter', 'dist/packages/nx-flutter');
      await runNxCommandAsync(
        `generate @nxrocks/nx-flutter:create ${appName}  --interactive=false --tags e2etag,e2ePackage`
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[appName].tags).toEqual(['e2etag', 'e2ePackage']);
      }, 200000);
  });
});
