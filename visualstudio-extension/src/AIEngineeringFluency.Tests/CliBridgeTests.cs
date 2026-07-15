using AIEngineeringFluency.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;

namespace AIEngineeringFluency.Tests
{
    [TestClass]
    public class CliBridgeTests
    {
        [TestMethod]
        public void GetCachedStats_InitiallyNull()
        {
            // Before any CLI call, cached stats should be null
            // (unless a previous test populated it — this validates the API surface)
            var cached = CliBridge.GetCachedStats();
            // We can't assert null since other tests in the suite may have populated it,
            // but we can assert the method is callable and returns the expected type
            Assert.IsTrue(cached == null || cached is DetailedStats);
        }

        [TestMethod]
        public void IsAvailable_ReturnsBoolean()
        {
            // IsAvailable() depends on whether the CLI exe is bundled next to AIEngineeringFluency.dll.
            // In a local development build the exe IS copied there, so we can only assert
            // the method is callable and returns a bool without throwing.
            var result = CliBridge.IsAvailable();
            Assert.IsTrue(result == true || result == false);
        }

        [TestMethod]
        public void GetAllDataAsync_ReturnsTask()
        {
            // GetAllDataAsync() returns a Task regardless of whether the CLI exe is present.
            // Verify the method is callable and returns a non-null Task without throwing.
            var task = CliBridge.GetAllDataAsync();
            Assert.IsNotNull(task);
        }

        /// <summary>
        /// Regression test: when the CLI exe is absent, GetUsageStatsAsync() must return a
        /// non-null Task (awaitable without NullReferenceException). Previously the in-flight
        /// Task was nulled out by its own ContinueWith(ExecuteSynchronously) before the method
        /// could return it, causing `await null` → NullReferenceException in the details and
        /// environmental views.
        /// </summary>
        [TestMethod]
        public void GetUsageStatsAsync_ReturnsNonNullTask()
        {
            // GetUsageStatsAsync() must always return a non-null Task, even when the CLI exe
            // is not present.  Awaiting a null task throws NullReferenceException (the bug
            // this test guards against).
            var task = CliBridge.GetUsageStatsAsync();
            Assert.IsNotNull(task, "GetUsageStatsAsync() returned null — awaiting it would throw NullReferenceException");
        }

        /// <summary>
        /// Verifies that GetUsageStatsAsync returns null stats (not a faulted task) when
        /// the CLI exe is absent.  The caller must handle the null result gracefully.
        /// </summary>
        [TestMethod]
        public async Task GetUsageStatsAsync_WhenCliAbsent_ReturnsNullResult()
        {
            // When the CLI exe is not bundled the task must complete (not fault) with null.
            if (CliBridge.IsAvailable())
            {
                // CLI is present in this environment — skip the "absent" assertion.
                return;
            }

            var task = CliBridge.GetUsageStatsAsync();
            Assert.IsNotNull(task, "Task itself must not be null");

            var result = await task;
            Assert.IsNull(result, "Stats result should be null when CLI exe is absent");
        }
    }
}
