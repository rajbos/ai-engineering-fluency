using System.ComponentModel;
using Community.VisualStudio.Toolkit;

namespace AIEngineeringFluency.Options
{
    /// <summary>
    /// Async-friendly singleton options model for AI Engineering Fluency.
    ///
    /// Uses <see cref="BaseOptionModel{T}"/> from the Community Visual Studio Toolkit so
    /// settings are loaded/saved asynchronously, thread-safely, and properly participate
    /// in Visual Studio's modern unified settings infrastructure.
    ///
    /// Access the live instance from any thread:
    /// <code>var opts = await GeneralOptions.GetLiveInstanceAsync();</code>
    /// </summary>
    public class GeneralOptions : BaseOptionModel<GeneralOptions>
    {
        [Category("Display")]
        [DisplayName("Use compact numbers")]
        [Description("Display token counts with K/M suffixes (e.g. 22K, 400M) instead of full numbers.")]
        public bool CompactNumbers { get; set; } = true;

        [Category("Toolbar")]
        [DisplayName("Show estimated cost in toolbar")]
        [Description("Append the estimated Copilot UBB cost in USD for today and the comparison period to the toolbar token summary (e.g. 66.7M | month 520.7M | $0.50 | $567.26).")]
        public bool ShowCostInToolbar { get; set; } = true;

        [Category("Toolbar")]
        [DisplayName("Toolbar comparison period")]
        [Description("The secondary period shown next to \"today\" in the toolbar summary: a rolling last-30-days total or the current calendar month.")]
        public ComparisonPeriod ToolbarComparisonPeriod { get; set; } = ComparisonPeriod.Last30Days;
    }
}
