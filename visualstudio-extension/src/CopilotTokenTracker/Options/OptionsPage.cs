using System.ComponentModel;
using Microsoft.VisualStudio.Shell;

namespace CopilotTokenTracker.Options
{
    /// <summary>
    /// Tools &gt; Options page for AI Engineering Fluency.
    ///
    /// Exposes the same display preferences the VS Code extension offers as settings:
    ///   • compact (short) number formatting (22K / 400M)
    ///   • the secondary period shown in the toolbar token summary
    ///
    /// Values are mirrored into <see cref="ExtensionSettings"/> so the rest of the
    /// extension can read them without taking a dependency on the package.
    /// </summary>
    public sealed class OptionsPage : DialogPage
    {
        private bool _compactNumbers = true;
        private ComparisonPeriod _toolbarComparisonPeriod = ComparisonPeriod.Last30Days;

        [Category("Display")]
        [DisplayName("Use compact numbers")]
        [Description("Display token counts with K/M suffixes (e.g. 22K, 400M) instead of full numbers.")]
        public bool CompactNumbers
        {
            get => _compactNumbers;
            set => _compactNumbers = value;
        }

        [Category("Toolbar")]
        [DisplayName("Toolbar comparison period")]
        [Description("The secondary period shown next to \"today\" in the toolbar / status bar summary: a rolling last-30-days total or the current calendar month.")]
        public ComparisonPeriod ToolbarComparisonPeriod
        {
            get => _toolbarComparisonPeriod;
            set => _toolbarComparisonPeriod = value;
        }

        /// <summary>Push the current values into the shared static accessor.</summary>
        public void Apply()
        {
            ExtensionSettings.CompactNumbers = _compactNumbers;
            ExtensionSettings.ToolbarComparisonPeriod = _toolbarComparisonPeriod;
        }

        protected override void OnApply(PageApplyEventArgs e)
        {
            base.OnApply(e);
            Apply();
        }

        public override void LoadSettingsFromStorage()
        {
            base.LoadSettingsFromStorage();
            Apply();
        }
    }
}
