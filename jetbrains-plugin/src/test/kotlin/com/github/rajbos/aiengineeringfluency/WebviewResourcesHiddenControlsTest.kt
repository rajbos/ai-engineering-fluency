package com.github.rajbos.aiengineeringfluency

import java.util.Locale
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * Nav buttons for views this plugin does not ship must be hidden: every shared bundle renders
 * them, and TokenTrackerPanel has no handler for their command, so a visible one is a dead
 * click. The plugin does not bundle efficiency.js (see build.gradle.kts) and does not handle
 * `showEfficiency`, so `#btn-efficiency` has to be in the hidden-controls rule.
 *
 * Pure JVM: the resource loader is injected, so no IDE is started.
 */
class WebviewResourcesHiddenControlsTest {

    private val loader: (String) -> String? = { path ->
        if (path.endsWith(".js")) "/*stub*/" else null
    }

    /** The selector list of the rule that hides unsupported controls. */
    private fun hiddenSelectors(view: String): String {
        val html = WebviewResources.buildHtml(view, "bridge()", "{}", Locale.ENGLISH, loader)
        val rule = Regex("""((?:[#.][\w-]+,\s*)*#btn-diagnostics,[^{]*)\{\s*display:\s*none""").find(html)
        assertTrue(rule != null, "$view: no hidden-controls rule found")
        return rule!!.groupValues[1]
    }

    @Test
    fun `the Efficiency nav button is hidden in every shipped view`() {
        for (view in listOf("details", "chart", "usage", "diagnostics", "environmental", "maturity", "fluency-level-viewer")) {
            assertTrue(hiddenSelectors(view).contains("#btn-efficiency"), "$view: #btn-efficiency is not hidden")
        }
    }
}
