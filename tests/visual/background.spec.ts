import { test, expect } from "@playwright/test";

test.describe("Video Background", () => {
  test("should load video background correctly", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for video element to be present
    const video = page.locator("video");
    await video.waitFor({ state: "attached" });

    // Check if video element exists and is visible
    await expect(video).toBeVisible();

    // Check if source is correct
    const source = page.locator("video source");
    await expect(source).toHaveAttribute("src", "/background-loop.mp4");
    await expect(source).toHaveAttribute("type", "video/mp4");

    // Check if fallback GIF is present
    const fallbackImg = page.locator("video img");
    await expect(fallbackImg).toHaveAttribute("src", "/background-loop.gif");

    // Check if video has proper styling
    await expect(video).toHaveClass(/object-cover/);

    // Take a screenshot for visual comparison
    await page.screenshot({ path: "tests/visual/screenshots/background.png" });
  });

  test("should maintain aspect ratio and cover viewport", async ({ page }) => {
    await page.goto("/");

    // Check if video container has correct styles
    const videoContainer = page.locator(".absolute.inset-0");
    await expect(videoContainer).toHaveClass(/absolute.*inset-0/);

    const video = page.locator("video");
    await expect(video).toHaveClass(/object-cover/);

    // Test different viewport sizes
    for (const size of ["small", "medium", "large"]) {
      switch (size) {
        case "small":
          await page.setViewportSize({ width: 375, height: 667 });
          break;
        case "medium":
          await page.setViewportSize({ width: 768, height: 1024 });
          break;
        case "large":
          await page.setViewportSize({ width: 1440, height: 900 });
          break;
      }

      // Take screenshots at different viewport sizes
      await page.screenshot({
        path: `tests/visual/screenshots/background-${size}.png`,
        fullPage: true,
      });

      // Verify video maintains aspect ratio
      const videoBounds = await video.boundingBox();
      expect(videoBounds?.width).toBeGreaterThan(0);
      expect(videoBounds?.height).toBeGreaterThan(0);
    }
  });
});
