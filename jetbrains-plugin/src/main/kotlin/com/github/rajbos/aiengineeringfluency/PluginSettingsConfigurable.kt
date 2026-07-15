package com.github.rajbos.aiengineeringfluency

import com.intellij.openapi.options.BoundConfigurable
import com.intellij.openapi.ui.DialogPanel
import com.intellij.ui.dsl.builder.bindSelected
import com.intellij.ui.dsl.builder.bindText
import com.intellij.ui.dsl.builder.panel

/**
 * Registers the "AI Engineering Fluency" page under
 * File → Settings → Tools → AI Engineering Fluency.
 *
 * Mirrors the `aiEngineeringFluency.display.*` settings from the VS Code extension.
 */
class PluginSettingsConfigurable : BoundConfigurable("AI Engineering Fluency") {

    override fun createPanel(): DialogPanel = panel {
        group("Cost Budget") {
            row("Monthly cost budget (USD):") {
                textField()
                    .bindText(
                        getter = {
                            val v = PluginSettings.instance.state.monthlyCostBudget
                            if (v <= 0.0) "" else v.toString()
                        },
                        setter = { raw ->
                            PluginSettings.instance.state.monthlyCostBudget =
                                raw.trim().toDoubleOrNull()?.takeIf { it >= 0 } ?: 0.0
                        },
                    )
                    .comment("Set to 0 to disable budget tracking. Used to show a reference line on the Est. Cost chart.")
            }
        }
        group("Display") {
            row {
                checkBox("Show token counts in compact format (K / M suffixes)")
                    .bindSelected(
                        getter = { PluginSettings.instance.state.compactNumbers },
                        setter = { PluginSettings.instance.state.compactNumbers = it },
                    )
            }
            row {
                checkBox("Use 24-hour time format")
                    .bindSelected(
                        getter = { PluginSettings.instance.state.use24HourTime },
                        setter = { PluginSettings.instance.state.use24HourTime = it },
                    )
            }
        }
    }
}
