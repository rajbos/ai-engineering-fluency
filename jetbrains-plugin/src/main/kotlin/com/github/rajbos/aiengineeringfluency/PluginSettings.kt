package com.github.rajbos.aiengineeringfluency

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage

/**
 * Application-level persistent settings for the AI Engineering Fluency plugin.
 * Stored in `ai-engineering-fluency.xml` inside the IDE config dir.
 *
 * Mirrors the VS Code settings under `aiEngineeringFluency.display.*`.
 */
@State(
    name = "AiEngineeringFluencySettings",
    storages = [Storage("ai-engineering-fluency.xml")],
)
class PluginSettings : PersistentStateComponent<PluginSettings.State> {

    data class State(
        var monthlyCostBudget: Double = 0.0,
        var compactNumbers: Boolean = true,
        var use24HourTime: Boolean = true,
    )

    private var myState = State()

    override fun getState(): State = myState

    override fun loadState(state: State) {
        myState = state
    }

    companion object {
        val instance: PluginSettings
            get() = ApplicationManager.getApplication().getService(PluginSettings::class.java)
    }
}
