<template>
  <div class="p-4 flex flex-col gap-6" style="background: #faf8f5; min-height: 100vh;">

    <div class="flex items-center justify-between px-1 py-2">
      <h1 style="font-size: 22px; font-weight: 700; color: #1c1917; letter-spacing: -0.3px;">Today</h1>
      <span style="font-size: 12px; color: #a8a29e; background: #f5f0eb; padding: 4px 10px; border-radius: 20px;">
        Design preview — Option A+C
      </span>
    </div>

    <div class="flex flex-col gap-3">

      <!-- Overdue task — warm red tint -->
      <div class="flex items-stretch gap-1.5">
        <div style="display:flex;align-items:center;justify-content:center;min-width:24px;color:#d4c4b8;">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <circle cx="3" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="11.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="11.5" r="1.2" fill="currentColor"/>
          </svg>
        </div>
        <div style="flex:1; background:#fff8f5; border:1px solid #fde8df; border-left:4px solid #f97316; border-radius:16px; padding:14px 16px; display:flex; gap:12px; align-items:flex-start;">
          <div style="width:40px;height:40px;border-radius:50%;border:2px solid #e2d4cc;flex-shrink:0;display:flex;align-items:center;justify-content:center;"></div>
          <div style="flex:1;">
            <p style="font-size:15px;font-weight:600;color:#1c1917;line-height:1.3;">File quarterly tax return</p>
            <p style="font-size:12px;color:#e25a1c;font-weight:600;margin-top:4px;">Due yesterday</p>
          </div>
          <div style="width:40px;height:40px;border-radius:12px;background:#fff0eb;display:flex;align-items:center;justify-content:center;color:#ea580c;flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><polygon points="4,2 16,9 4,16" fill="currentColor"/></svg>
          </div>
        </div>
      </div>

      <!-- In-progress task — warm purple tint -->
      <div class="flex items-stretch gap-1.5">
        <div style="display:flex;align-items:center;justify-content:center;min-width:24px;color:#d4c4b8;">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <circle cx="3" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="11.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="11.5" r="1.2" fill="currentColor"/>
          </svg>
        </div>
        <div style="flex:1; background:#faf5ff; border:1px solid #e9d8fd; border-left:4px solid #9333ea; border-radius:16px; padding:14px 16px; display:flex; gap:12px; align-items:flex-start;">
          <div style="width:40px;height:40px;border-radius:50%;border:2px solid #e2d4cc;flex-shrink:0;display:flex;align-items:center;justify-content:center;"></div>
          <div style="flex:1;">
            <p style="font-size:15px;font-weight:600;color:#1c1917;line-height:1.3;">Write project proposal</p>
            <p style="font-size:12px;color:#9333ea;font-weight:600;margin-top:4px;">In progress · ~45 min</p>
          </div>
          <div style="width:40px;height:40px;border-radius:12px;background:#f3e8ff;display:flex;align-items:center;justify-content:center;color:#9333ea;flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><polygon points="4,2 16,9 4,16" fill="currentColor"/></svg>
          </div>
        </div>
      </div>

      <!-- Normal task — warm neutral -->
      <div class="flex items-stretch gap-1.5">
        <div style="display:flex;align-items:center;justify-content:center;min-width:24px;color:#d4c4b8;">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <circle cx="3" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="11.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="11.5" r="1.2" fill="currentColor"/>
          </svg>
        </div>
        <div style="flex:1; background:#fffdf9; border:1px solid #ede8e3; border-left:4px solid #d4c4b8; border-radius:16px; padding:14px 16px; display:flex; gap:12px; align-items:flex-start;">
          <div style="width:40px;height:40px;border-radius:50%;border:2px solid #d4c4b8;flex-shrink:0;display:flex;align-items:center;justify-content:center;"></div>
          <div style="flex:1;">
            <p style="font-size:15px;font-weight:600;color:#1c1917;line-height:1.3;">Call dentist to reschedule</p>
            <p style="font-size:12px;color:#a8a29e;margin-top:4px;">Working on today · Quick</p>
          </div>
          <div style="width:40px;height:40px;border-radius:12px;background:#f5f0eb;display:flex;align-items:center;justify-content:center;color:#a8a29e;flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><polygon points="4,2 16,9 4,16" fill="currentColor"/></svg>
          </div>
        </div>
      </div>

      <!-- Quiet task — warm sky tint -->
      <div class="flex items-stretch gap-1.5">
        <div style="display:flex;align-items:center;justify-content:center;min-width:24px;color:#d4c4b8;">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <circle cx="3" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="2.5" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="3" cy="11.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="11.5" r="1.2" fill="currentColor"/>
          </svg>
        </div>
        <div style="flex:1; background:#f5fbff; border:1px solid #daeef8; border-left:4px solid #64a8c8; border-radius:16px; padding:14px 16px; display:flex; gap:12px; align-items:flex-start;">
          <div style="width:40px;height:40px;border-radius:50%;border:2px solid #c4dde8;flex-shrink:0;display:flex;align-items:center;justify-content:center;"></div>
          <div style="flex:1;">
            <p style="font-size:15px;font-weight:600;color:#1c1917;line-height:1.3;">Research new laptop options</p>
            <p style="font-size:12px;color:#64a8c8;font-weight:500;margin-top:4px;">Quiet · 2/5 done</p>
          </div>
          <div style="width:40px;height:40px;border-radius:12px;background:#e8f4fa;display:flex;align-items:center;justify-content:center;color:#64a8c8;flex-shrink:0;">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><polygon points="4,2 16,9 4,16" fill="currentColor"/></svg>
          </div>
        </div>
      </div>

      <!-- Done task — warm green -->
      <div class="flex items-stretch gap-1.5">
        <div style="display:flex;align-items:center;justify-content:center;min-width:24px;color:#d4c4b8;"></div>
        <div style="flex:1; background:#f5fbf0; border:1px solid #d5ebb8; border-left:4px solid #639922; border-radius:16px; padding:14px 16px; display:flex; gap:12px; align-items:flex-start; opacity:0.8;">
          <div style="width:40px;height:40px;border-radius:50%;background:#639922;border:2px solid #639922;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-size:14px;">✓</span>
          </div>
          <div style="flex:1;">
            <p style="font-size:15px;font-weight:600;color:#4a7a18;line-height:1.3;text-decoration:line-through;">Morning standup</p>
            <p style="font-size:12px;color:#7da84a;margin-top:4px;">Done at 9:15am</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Visual notes -->
    <div style="border-top:1px solid #ede8e3;padding-top:20px;display:flex;flex-direction:column;gap:12px;">
      <p style="font-size:13px;font-weight:600;color:#78716c;">Design direction: Warm + Colourful cards (A+C)</p>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;color:#a8a29e;line-height:1.6;">
        <p>• Background: warm stone <code style="background:#f5f0eb;padding:1px 5px;border-radius:4px;color:#78716c;">#faf8f5</code> instead of neutral-50</p>
        <p>• Cards: tinted per status — orange/overdue, purple/in-progress, sky/quiet, green/done, stone/default</p>
        <p>• Typography: slightly heavier weight (-0.3px tracking on headings)</p>
        <p>• Borders: warm stone instead of cold gray</p>
        <p>• Accent: amber for Park It button, keeps purple for focus/actions</p>
        <p>• Drag handles: warm stone color, less visually harsh</p>
      </div>
      <p style="font-size:12px;color:#c4b8b0;margin-top:4px;">This page is preview-only — no real data, no changes to the app.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
</script>
