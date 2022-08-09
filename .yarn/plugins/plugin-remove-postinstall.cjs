module.exports = {
  name: 'plugin-remove-postinstall',
  factory: () => ({
    hooks: {
      beforeWorkspacePacking(workspace, rawManifest) {
        delete rawManifest.scripts.postinstall;
      },
    },
  }),
};
