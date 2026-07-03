using Community.VisualStudio.Toolkit;

namespace AIEngineeringFluency.Options
{
    /// <summary>
    /// Tools &gt; Options page for AI Engineering Fluency.
    ///
    /// This is intentionally a thin shell — all settings and their defaults live in
    /// <see cref="GeneralOptions"/> which extends <see cref="BaseOptionModel{T}"/>.
    /// The Community Toolkit handles async load/save and proper VS settings integration.
    /// </summary>
    public sealed class OptionsPage : BaseOptionPage<GeneralOptions> { }
}
