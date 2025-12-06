import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)

        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass

        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass

        # Interact with the page elements to simulate user flow
 
        # -> Input email and password, then click Sign in button to login and navigate to Course Catalog page
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('humancatalystnote@gmail.com')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123456')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/form/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Browse Courses' button to navigate to Course Catalog page.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select one course by clicking the 'Continue' button on a course card to view detailed course page.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/aside/div/nav/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate back to Course Catalog page by clicking the 'Courses' button in the top navigation bar.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/aside/div/nav/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select one course by clicking the 'Continue' button on the first course card under Ignition school to view detailed course page.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div/div/div[3]/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Continue Learning' button to proceed with enrollment or course engagement.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div/div/div/div[5]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Mark as Complete (+50 XP)' button to simulate course engagement and verify enrollment functionality.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div/div/div[2]/div[2]/div/div[3]/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Mark as Complete (+50 XP)' button to simulate course engagement and verify enrollment functionality.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div/div/div[2]/div[2]/div/div[3]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate back to the user profile or dashboard to verify the course is listed under enrolled courses.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/aside/div/nav/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Profile' button to navigate to the user profile page and verify the enrolled course is listed.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/aside/div/nav/button[6]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Search for any navigation or tab on the profile page that might show enrolled courses or learning history, or report the issue if no such option is found.
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/aside/div/nav/button[8]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Enrollment Completed Successfully!').first).to_be_visible(timeout=3000)
        except AssertionError:
            raise AssertionError("Test case failed: Enrollment process did not complete successfully as expected. The success message 'Enrollment Completed Successfully!' was not found on the page, indicating the test plan execution has failed.")
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    