namespace CopilotTokenTracker.Options
{
    /// <summary>
    /// Which secondary period the toolbar/status-bar token summary compares "today" against.
    /// Mirrors the VS Code <c>aiEngineeringFluency</c> toolbar period options.
    /// </summary>
    public enum ComparisonPeriod
    {
        /// <summary>Rolling last-30-days total (default).</summary>
        Last30Days,

        /// <summary>Calendar current-month total.</summary>
        CurrentMonth,
    }

    /// <summary>
    /// Process-wide accessor for user-configurable settings.
    ///
    /// The values are seeded from the Tools &gt; Options page (<see cref="OptionsPage"/>) at
    /// package init and refreshed whenever the user applies the options dialog. Keeping them
    /// in a static holder avoids threading a package reference through the WebView control and
    /// the toolbar command (both of which read settings off the UI thread).
    /// </summary>
    internal static class ExtensionSettings
    {
        /// <summary>
        /// When <c>true</c> (default) numbers are rendered with K/M suffixes (e.g. 22K, 400M).
        /// Injected into the webview payloads as <c>compactNumbers</c>.
        /// </summary>
        public static bool CompactNumbers { get; set; } = true;

        /// <summary>
        /// Secondary period shown next to "today" in the toolbar/status-bar summary.
        /// </summary>
        public static ComparisonPeriod ToolbarComparisonPeriod { get; set; } = ComparisonPeriod.Last30Days;
    }
}
