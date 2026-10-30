import os
import time
import shutil
import subprocess
from playwright.sync_api import sync_playwright

os.makedirs("scratch/raw_video", exist_ok=True)
# Clean previous recordings
for f in os.listdir("scratch/raw_video"):
    os.remove(os.path.join("scratch/raw_video", f))

start_time = time.time()
print(f"[{time.time()-start_time:.1f}s] Starting video recording automation...")

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    context = browser.new_context(
        record_video_dir="scratch/raw_video",
        record_video_size={"width": 1920, "height": 1080},
        viewport={"width": 1920, "height": 1080}
    )
    page = context.new_page()

    # --- SCENE 1: Introduction & Hero Metric Deck (0:00 - 0:13) ---
    print(f"[{time.time()-start_time:.1f}s] Scene 1: Loading Necropolis landing page...")
    page.goto("https://wake-necropolis.onrender.com", wait_until="networkidle")
    time.sleep(2)
    
    # Smooth mouse moves across the metric deck
    page.mouse.move(300, 280, steps=20)
    time.sleep(1.5)
    page.mouse.move(650, 420, steps=25)
    time.sleep(2)
    page.mouse.move(950, 420, steps=25)
    time.sleep(2)
    page.mouse.move(1250, 420, steps=25)
    time.sleep(2)

    # --- SCENE 2: Headstone Dossier & Grounded Obituary (0:13 - 0:34) ---
    print(f"[{time.time()-start_time:.1f}s] Scene 2: Inspecting Featured Headstone...")
    inspect_btn = page.locator("text=Inspect Featured Headstone")
    if inspect_btn.count() > 0:
        inspect_btn.first.click()
    else:
        page.locator("text=src/lib/legacy_prototype.ts").first.click()
    
    time.sleep(2.5) # Wait for slide drawer
    
    # Hover over vital trajectory
    page.mouse.move(1350, 240, steps=20)
    time.sleep(2)
    
    # Scroll down inside the drawer
    drawer = page.locator("div.fixed.right-0, aside, div[role='dialog'], [class*='translate-x-0']").first
    page.mouse.wheel(0, 300)
    time.sleep(2)
    
    # Click verified commit chip
    chip = page.locator("button:has-text('commit ')").first
    if chip.count() > 0:
        chip.click()
        time.sleep(3) # Show expanded author, date, message
    
    # Scroll further down to see deletion diff and hauntings
    page.mouse.wheel(0, 400)
    time.sleep(3)
    
    # Close Headstone sheet
    close_btn = page.locator("button:has-text('Close')")
    if close_btn.count() > 0:
        close_btn.first.click()
    else:
        page.keyboard.press("Escape")
    time.sleep(2)

    # --- SCENE 3: The Ghost in the Machine / Haunting Radar (0:34 - 0:48) ---
    print(f"[{time.time()-start_time:.1f}s] Scene 3: Navigating to Haunting Radar...")
    hauntings_link = page.locator("header a[href='/hauntings']").first
    hauntings_link.click()
    page.wait_for_load_state("networkidle")
    time.sleep(2.5)
    
    # Scroll down through active hauntings
    page.mouse.move(600, 380, steps=20)
    time.sleep(2)
    page.mouse.wheel(0, 300)
    time.sleep(2.5)
    page.mouse.wheel(0, 300)
    time.sleep(2.5)

    # --- SCENE 4: Exorcise Modal & Theme Toggle (0:48 - 0:61) ---
    print(f"[{time.time()-start_time:.1f}s] Scene 4: Opening Exorcise Modal...")
    exorcise_btn = page.locator("button:has-text('Exorcise')").first
    if exorcise_btn.count() > 0:
        exorcise_btn.click()
        time.sleep(2.5)
        # Click Copy Diff button
        copy_btn = page.locator("button:has-text('Copy Unified Diff')").first
        if copy_btn.count() > 0:
            copy_btn.click()
            time.sleep(2)
        page.keyboard.press("Escape")
        time.sleep(1.5)
    
    # Toggle theme: Dark -> Light
    print(f"[{time.time()-start_time:.1f}s] Toggling to Light Theme...")
    theme_btn = page.locator("header button:has-text('Dark'), header button:has-text('Light')").first
    theme_btn.click()
    time.sleep(3) # Admire light mode
    
    # Toggle back to Dark
    print(f"[{time.time()-start_time:.1f}s] Toggling back to Dark Theme...")
    theme_btn.click()
    time.sleep(2)

    # --- SCENE 5: Multi-Repo Switcher & Outro (0:61 - 0:73) ---
    print(f"[{time.time()-start_time:.1f}s] Scene 5: Return to Necropolis and Outro...")
    necropolis_link = page.locator("header a[href='/']").first
    necropolis_link.click()
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    # Scroll to D3 spectrogram timeline
    page.mouse.wheel(0, 450)
    time.sleep(2.5)
    
    # Check if multi-repo select exists
    repo_select = page.locator("select").first
    if repo_select.count() > 0:
        options = repo_select.locator("option")
        if options.count() > 1:
            repo_select.select_option(index=1)
            time.sleep(3)

    # Smooth scroll back to top header brand
    page.mouse.wheel(0, -500)
    time.sleep(2)

    # Pad until exactly 73 seconds for seamless audio sync
    elapsed = time.time() - start_time
    if elapsed < 73:
        remaining = 73 - elapsed
        print(f"Holding final shot for {remaining:.1f}s to match audio duration...")
        time.sleep(remaining)

    context.close()
    browser.close()

print(f"[{time.time()-start_time:.1f}s] Video recording complete!")
video_files = [os.path.join("scratch/raw_video", f) for f in os.listdir("scratch/raw_video") if f.endswith(".webm")]
print("Generated video file:", video_files)
