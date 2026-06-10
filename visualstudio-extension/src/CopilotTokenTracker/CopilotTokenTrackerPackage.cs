using System;
using System.Runtime.InteropServices;
using System.Threading;
using Microsoft.VisualStudio;
using Microsoft.VisualStudio.Shell;
using Microsoft.VisualStudio.Shell.Interop;
using Task = System.Threading.Tasks.Task;

namespace CopilotTokenTracker
{
    /// <summary>
    /// Main VS package for AI Engineering Fluency.
    ///
    /// Registers the tool window and the Show command, and initialises the
    /// session-discovery background refresh on IDE startup.
    /// </summary>
    [PackageRegistration(UseManagedResourcesOnly = true, AllowsBackgroundLoading = true)]
    [Guid(PackageGuidString)]
    [ProvideMenuResource("Menus.ctmenu", 1)]
    [ProvideToolWindow(
        typeof(ToolWindow.TokenTrackerToolWindow),
        Style           = VsDockStyle.Tabbed,
        Window          = ToolWindowGuids80.SolutionExplorer,
        Orientation     = ToolWindowOrientation.Right,
        Transient       = false)]
    [ProvideAutoLoad(VSConstants.UICONTEXT.NoSolution_string, PackageAutoLoadFlags.BackgroundLoad)]
    [ProvideAutoLoad(UIContextGuids80.SolutionExists, PackageAutoLoadFlags.BackgroundLoad)]
    [ProvideOptionPage(typeof(Options.OptionsPage), "AI Engineering Fluency", "General", 0, 0, supportsAutomation: true)]
    public sealed class CopilotTokenTrackerPackage : AsyncPackage
    {
        /// <summary>Package identity GUID — must match source.extension.vsixmanifest and .vsct.</summary>
        public const string PackageGuidString = "6B8CA5B3-1A9F-4C2E-8F3D-7E2A1B4C9D0F";

        protected override async Task InitializeAsync(
            CancellationToken cancellationToken,
            IProgress<ServiceProgressData> progress)
        {
            await this.JoinableTaskFactory.SwitchToMainThreadAsync(cancellationToken);

            try
            {
                // Initialize logging
                Utilities.OutputLogger.Initialize(this);
                Utilities.OutputLogger.Log("=== AI Engineering Fluency Extension Starting ===");

                // Seed user settings from the Tools > Options page so the WebView control
                // and toolbar command can read them via the static ExtensionSettings holder.
                SeedSettings();
                Utilities.OutputLogger.Log($"Package GUID: {PackageGuidString}");
                Utilities.OutputLogger.Log($"Visual Studio Version: {this.ApplicationRegistryRoot}");

                // Initialize commands
                Utilities.OutputLogger.Log("Initializing commands...");
                await Commands.ShowTokenTrackerCommand.InitializeAsync(this);
                await Commands.ToolbarInfoCommand.InitializeAsync(this);
                Utilities.OutputLogger.Log("Commands initialized successfully");

                // Force-show our custom toolbar (VS caches visibility state from
                // previous sessions; this ensures it always appears).
                ShowCustomToolbar();

                Utilities.OutputLogger.Log("=== Extension Initialized Successfully ===");

                // Don't auto-show the tool window during init — it can crash if
                // WebView2 isn't ready yet. Users open it via View > AI Engineering Fluency.
            }
            catch (Exception ex)
            {
                Utilities.OutputLogger.LogError("Failed to initialize extension", ex);
                throw;
            }
        }

        /// <summary>
        /// Loads the Options page from storage and mirrors its values into
        /// <see cref="Options.ExtensionSettings"/>. Safe to fail — defaults are used.
        /// </summary>
        private void SeedSettings()
        {
            try
            {
                if (GetDialogPage(typeof(Options.OptionsPage)) is Options.OptionsPage page)
                {
                    page.Apply();
                    Utilities.OutputLogger.Log(
                        $"Settings seeded: compactNumbers={Options.ExtensionSettings.CompactNumbers}, " +
                        $"toolbarPeriod={Options.ExtensionSettings.ToolbarComparisonPeriod}");
                }
            }
            catch (Exception ex)
            {
                Utilities.OutputLogger.LogWarning($"Could not seed settings: {ex.Message}");
            }
        }

        /// <summary>
        /// Make the "AI Engineering Fluency" toolbar visible via DTE CommandBars.
        /// Uses late-binding (dynamic) to avoid a hard reference on the
        /// CommandBars interop assembly.
        /// </summary>
        private void ShowCustomToolbar()
        {
            try
            {
                Microsoft.VisualStudio.Shell.ThreadHelper.ThrowIfNotOnUIThread();
                if (GetService(typeof(EnvDTE.DTE)) is EnvDTE80.DTE2 dte)
                {
                    dynamic bars = dte.CommandBars;
                    dynamic toolbar = bars["AI Engineering Fluency"];
                    if (!(bool)toolbar.Visible)
                    {
                        toolbar.Visible = true;
                        Utilities.OutputLogger.Log("Custom toolbar forced visible");
                    }
                    else
                    {
                        Utilities.OutputLogger.Log("Custom toolbar already visible");
                    }
                }
            }
            catch (Exception ex)
            {
                Utilities.OutputLogger.LogWarning($"Could not auto-show toolbar: {ex.Message}");
            }
        }
    }
}
