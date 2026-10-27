"""Tests for badge-app/fluency/fluency_motion.py. Run: python -m unittest discover -s badge-app/tests"""

import math
import os
import sys
import unittest

APP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fluency")
sys.path.insert(0, APP_DIR)

import fluency_motion as fm  # noqa: E402

FACES = ("top", "front", "back", "left", "right")


def visible_faces(camera, x, z):
    faces = fm.box_faces(x, z, 1, 1, 2)
    return [name for name, (corners, _) in zip(FACES, faces)
            if fm.faces_viewer([camera.project(*p) for p in corners])]


class LookTests(unittest.TestCase):
    def test_next_look_cycles_both_ways(self):
        self.assertEqual(fm.next_look(0), 1)
        self.assertEqual(fm.next_look(len(fm.LOOKS) - 1), 0)
        self.assertEqual(fm.next_look(0, -1), len(fm.LOOKS) - 1)

    def test_saved_look_round_trips(self):
        for index in range(len(fm.LOOKS)):
            self.assertEqual(fm.parse_look(fm.dump_look(index)), index)

    def test_unreadable_saved_look_gives_default(self):
        for text in ("", "not json", "[]", '{"look": "hologram"}', '{"look": 2}', None):
            self.assertEqual(fm.parse_look(text), fm.DEFAULT_LOOK)

    def test_every_look_has_a_label(self):
        self.assertEqual([fm.look_label(i) for i in range(3)], ["Motion", "3D radar", "3D skyline"])


class EasingTests(unittest.TestCase):
    def test_eases_hit_their_ends_and_clamp(self):
        for ease in (fm.ease_out, fm.ease_in_out):
            self.assertEqual(ease(0), 0)
            self.assertEqual(ease(1), 1)
            self.assertEqual(ease(-3), 0)
            self.assertEqual(ease(7), 1)
        self.assertAlmostEqual(fm.ease_in_out(0.5), 0.5)

    def test_stagger_delays_later_items(self):
        self.assertGreater(fm.stagger(200, 0, 50, 400), fm.stagger(200, 3, 50, 400))
        self.assertEqual(fm.stagger(0, 2, 50, 400), 0)
        self.assertEqual(fm.stagger(10000, 29, 50, 400), 1)

    def test_approach_is_frame_rate_independent(self):
        one_step = fm.approach(0.0, 10.0, 100, 70)
        two_steps = fm.approach(fm.approach(0.0, 10.0, 50, 70), 10.0, 50, 70)
        self.assertAlmostEqual(one_step, two_steps)
        self.assertEqual(fm.approach(3.0, 10.0, 0, 70), 3.0)

    def test_pulse_stays_in_range(self):
        values = [fm.pulse(t) for t in range(0, 2400, 37)]
        self.assertTrue(all(0 <= v <= 1 for v in values))
        self.assertAlmostEqual(fm.pulse(0), 0)
        self.assertAlmostEqual(fm.pulse(600), 1)

    def test_ease_out_back_overshoots_then_settles(self):
        self.assertEqual(fm.ease_out_back(0), 0)
        self.assertAlmostEqual(fm.ease_out_back(1), 1)
        self.assertAlmostEqual(fm.ease_out_back(5), 1)
        self.assertEqual(fm.ease_out_back(-1), 0)
        self.assertGreater(max(fm.ease_out_back(t / 20) for t in range(21)), 1.05)

    def test_shade_and_mix_clamp(self):
        self.assertEqual(fm.shade((200, 100, 0), 2), (255, 200, 0))
        self.assertEqual(fm.shade((200, 100, 10), 0.5), (100, 50, 5))
        self.assertEqual(fm.mix((0, 0, 0), (100, 200, 50), 0.5), (50, 100, 25))
        self.assertEqual(fm.mix((0, 0, 0), (100, 200, 50), 4), (100, 200, 50))


class ReloadTests(unittest.TestCase):
    def test_reload_cycle_counts_periods(self):
        self.assertEqual(fm.reload_cycle(-5, 1000), (0, 0))
        self.assertEqual(fm.reload_cycle(999, 1000), (0, 999))
        self.assertEqual(fm.reload_cycle(2500, 1000), (2, 500))

    def test_every_reload_gets_a_different_colour(self):
        palette = ((1, 1, 1), (2, 2, 2), (3, 3, 3))
        first = (9, 9, 9)
        colours = [fm.cycle_colour(first, palette, cycle) for cycle in range(5)]
        self.assertEqual(colours, [first, (1, 1, 1), (2, 2, 2), (3, 3, 3), (1, 1, 1)])
        self.assertTrue(all(a != b for a, b in zip(colours, colours[1:])))


class SonarTests(unittest.TestCase):
    def test_not_started_before_time_zero(self):
        self.assertIsNone(fm.sonar_ping(-1, 0, 3, 3000))

    def test_ring_grows_and_fades(self):
        early = fm.sonar_ping(100, 0, 3, 3000)
        late = fm.sonar_ping(2900, 0, 3, 3000)
        self.assertLess(early[0], late[0])
        self.assertGreater(early[1], late[1])
        self.assertTrue(all(0 <= v <= 1 for v in early + late))

    def test_rings_are_spread_over_the_period(self):
        radii = [fm.sonar_ping(500, i, 3, 3000)[0] for i in range(3)]
        self.assertEqual(len(set(radii)), 3)


class CameraTests(unittest.TestCase):
    def test_origin_lands_on_the_centre(self):
        x, y, depth = fm.Camera(160, 120, 30).project(0, 0, 0)
        self.assertEqual((x, y, depth), (160, 120, 0))

    def test_looking_down_puts_far_points_higher_and_nearer_ones_bigger(self):
        camera = fm.Camera(160, 120, 30, yaw=0, pitch=0.6)
        near = camera.project(1, 0, -1)
        far = camera.project(1, 0, 1)
        self.assertGreater(near[1], far[1])  # screen y grows downwards
        self.assertLess(near[2], far[2])
        self.assertGreater(near[0] - 160, far[0] - 160)  # perspective shrinks the far one

    def test_yaw_turns_about_the_vertical_axis(self):
        camera = fm.Camera(0, 0, 10, yaw=math.pi / 2, pitch=0)
        x, y, _ = camera.project(1, 0, 0)
        self.assertAlmostEqual(y, 0)
        self.assertAlmostEqual(x, 0, places=6)

    def test_culling_shows_the_sides_that_face_the_camera(self):
        camera = fm.Camera(160, 120, 30, yaw=0, pitch=0.5)
        self.assertEqual(visible_faces(camera, -3, 0), ["top", "front", "right"])
        self.assertEqual(visible_faces(camera, 2, 0), ["top", "front", "left"])

    def test_signed_area_follows_screen_winding(self):
        clockwise_on_screen = [(0, 0), (10, 0), (10, 10), (0, 10)]
        self.assertGreater(fm.signed_area(clockwise_on_screen), 0)
        self.assertLess(fm.signed_area(list(reversed(clockwise_on_screen))), 0)


class RadarTests(unittest.TestCase):
    def test_first_spoke_points_at_the_viewer(self):
        x, z = fm.radar_spoke(0, 6, 1.0)
        self.assertAlmostEqual(x, 0)
        self.assertAlmostEqual(z, -1)

    def test_polygon_scales_with_value_and_keeps_a_floor(self):
        points = fm.radar_polygon([4, 0, 2], 4, floor=0.1)
        radii = [math.hypot(x, z) for x, z in points]
        self.assertAlmostEqual(radii[0], 1.0)
        self.assertAlmostEqual(radii[1], 0.1)
        self.assertAlmostEqual(radii[2], 0.55)

    def test_values_above_the_maximum_are_capped(self):
        x, z = fm.radar_polygon([9], 4)[0]
        self.assertAlmostEqual(math.hypot(x, z), 1.0)


class SpiderTests(unittest.TestCase):
    def test_sweep_turns_once_evenly_then_idles_slowly(self):
        self.assertEqual(fm.sweep_fraction(-50, 1500, 7000), 0.0)
        self.assertEqual(fm.sweep_fraction(0, 1500, 7000), 0.0)
        self.assertAlmostEqual(fm.sweep_fraction(750, 1500, 7000), 0.5)
        self.assertAlmostEqual(fm.sweep_fraction(1500, 1500, 7000), 0.0)  # wraps as the idle turn starts
        self.assertAlmostEqual(fm.sweep_fraction(1500 + 3500, 1500, 7000), 0.5)
        self.assertAlmostEqual(fm.sweep_fraction(1500 + 7000 + 700, 1500, 7000), 0.1)
        self.assertTrue(all(0 <= fm.sweep_fraction(t, 1500, 7000) < 1 for t in range(0, 20000, 37)))

    def test_spokes_pop_in_sweep_order(self):
        count = 6
        self.assertGreater(fm.spoke_reveal(200, 0, count, 1500, 450), 0)
        self.assertEqual(fm.spoke_reveal(200, 1, count, 1500, 450), 0)  # the arm has not reached spoke 1 yet
        self.assertGreater(fm.spoke_reveal(300, 1, count, 1500, 450), 0)  # 1500 / 6 = 250 ms per spoke
        self.assertAlmostEqual(fm.spoke_reveal(5000, 5, count, 1500, 450), 1)
        reveals = [fm.spoke_reveal(900, i, count, 1500, 450) for i in range(count)]
        self.assertEqual([r > 0 for r in reveals], [True, True, True, True, False, False])
        settled = [min(1.0, r) for r in reveals]  # a spoke mid-pop overshoots 1, so compare clamped
        self.assertEqual(settled, sorted(settled, reverse=True))

    def test_arc_points_run_clockwise_from_straight_up(self):
        points = fm.arc_points(100, 100, 10, 0, math.pi / 2, 2)
        self.assertEqual(len(points), 3)
        self.assertAlmostEqual(points[0][0], 100)
        self.assertAlmostEqual(points[0][1], 90)  # straight up: smaller y
        self.assertAlmostEqual(points[2][0], 110)  # a quarter turn clockwise: to the right
        self.assertAlmostEqual(points[2][1], 100)
        self.assertTrue(all(abs(math.hypot(x - 100, y - 100) - 10) < 1e-9 for x, y in points))


class SkylineTests(unittest.TestCase):
    def test_weekday(self):
        self.assertEqual(fm.weekday("2026-10-26"), 0)  # Monday
        self.assertEqual(fm.weekday("2026-10-23"), 4)  # Friday
        self.assertEqual(fm.weekday("2024-02-29"), 3)  # leap day, Thursday
        self.assertEqual(fm.weekday("2026-01-04"), 6)  # Sunday
        for bad in ("", "yesterday", "2026-13-01", None):
            self.assertIsNone(fm.weekday(bad))

    def test_cells_follow_the_calendar(self):
        days = [("2026-10-%02d" % d, 1, 1) for d in range(23, 28)]  # Fri .. Tue
        self.assertEqual(fm.skyline_cells(days), [(4, 0), (5, 0), (6, 0), (0, 1), (1, 1)])

    def test_cells_fall_back_to_rows_of_seven(self):
        days = [("day %d" % d, 1, 1) for d in range(9)]
        cells = fm.skyline_cells(days)
        self.assertEqual(cells[0], (0, 0))
        self.assertEqual(cells[7], (0, 1))
        self.assertEqual(fm.skyline_cells([]), [])

    def test_thirty_days_fit_in_six_weeks(self):
        days = [("2026-09-%02d" % d, 1, 1) for d in range(1, 31)]
        rows = {row for _, row in fm.skyline_cells(days)}
        self.assertLessEqual(len(rows), 6)


if __name__ == "__main__":
    unittest.main()
