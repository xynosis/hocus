<template>
  <!-- Board title — floating top-left (offset for sidebar on sm) -->
  <div class="fixed top-3 left-3 sm:left-[236px] z-20 flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <button
      type="button"
      class="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex-shrink-0"
      @click="navigateTo('/canvas')"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M8 2L3 6l5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Boards
    </button>
    <span class="text-neutral-200 dark:text-neutral-700 text-xs select-none">/</span>
    <input
      v-model="boardTitle"
      type="text"
      class="text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-transparent border-none outline-none placeholder:text-neutral-400 min-w-0 w-32"
      placeholder="Untitled board"
      @blur="saveTitle"
      @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
    />
  </div>

  <!-- Floating tool sidebar — left-center (offset for sidebar on sm) -->
  <div class="fixed left-3 sm:left-[236px] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-0.5 p-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <!-- Pan -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
      :class="activeTool === 'pan'
        ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
      title="Pan — drag to move around (default)"
      @click="selectMode = false; linkMode = false; showAddPanel = false"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M6.5 1.5v4h-2a1 1 0 00-.7 1.7l3.7 3.7 3.7-3.7a1 1 0 00-.7-1.7h-2v-4a1 1 0 00-2 0z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Select -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
      :class="activeTool === 'select'
        ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
      title="Select — drag to lasso. Hold Space to pan temporarily."
      @click="selectMode = true; linkMode = false; showAddPanel = false"
    >
      <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
        <path d="M2 1.5l7 4-3 1L5 10 2 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="w-5 h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />

    <!-- Frame -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      title="Frame — drag to place or click to add at centre"
      @pointerdown.stop="onSidebarToolPointerDown($event, 'frame')"
    >
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.25" stroke-dasharray="3 2"/>
      </svg>
    </button>

    <!-- Rect -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      title="Rectangle — drag to place or click to add at centre"
      @pointerdown.stop="onSidebarToolPointerDown($event, 'rect')"
    >
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.25"/>
      </svg>
    </button>

    <!-- Ellipse -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      title="Ellipse — drag to place or click to add at centre"
      @pointerdown.stop="onSidebarToolPointerDown($event, 'ellipse')"
    >
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <ellipse cx="7" cy="7" rx="5.5" ry="5.5" stroke="currentColor" stroke-width="1.25"/>
      </svg>
    </button>

    <!-- Sticky note -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      title="Sticky note — drag to place or click to add at centre"
      @pointerdown.stop="onSidebarToolPointerDown($event, 'note')"
    >
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="1.5" width="11" height="11" rx="2" fill="currentColor" opacity="0.15"/>
        <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.25"/>
        <path d="M4 5h6M4 7.5h4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>
      </svg>
    </button>

    <!-- Text -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      title="Freeform text — drag to place or click to add at centre"
      @pointerdown.stop="onSidebarToolPointerDown($event, 'text')"
    >
      <span class="font-serif italic text-base leading-none">T</span>
    </button>

    <div class="w-5 h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />

    <!-- Tasks / docs -->
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
      :class="showAddPanel
        ? 'bg-purple-500 text-white'
        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
      title="Add tasks or documents"
      @click="showAddPanel = !showAddPanel; linkMode = false"
    >
      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
        <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <!-- Zoom controls — bottom-left (offset for sidebar on sm) -->
  <div class="fixed bottom-3 left-3 sm:left-[236px] z-20 flex items-center gap-0.5 px-1.5 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <button type="button" class="w-6 h-6 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800" @click="adjustZoom(1 / 1.2)">−</button>
    <button type="button" class="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors tabular-nums w-9 text-center" @click="resetView">{{ Math.round(zoom * 100) }}%</button>
    <button type="button" class="w-6 h-6 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800" @click="adjustZoom(1.2)">+</button>
  </div>

  <!-- Link mode hint — bottom-centre floating pill -->
  <Transition name="fade">
    <div
      v-if="linkMode"
      class="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-full shadow-sm text-xs text-purple-600 dark:text-purple-400"
    >
      {{ linkStartId ? 'Now click the card to connect to' : 'Click a card to start a connection' }}
      <button type="button" class="underline" @click="toggleLinkMode">Cancel</button>
    </div>
  </Transition>

  <!-- Canvas container -->
  <div
    ref="canvasRef"
    class="fixed inset-0 overflow-hidden touch-none"
    :class="[
      isPanning ? 'cursor-grabbing' : linkMode ? 'cursor-crosshair' : (selectMode && !temporaryPan) ? 'cursor-default' : 'cursor-grab',
    ]"
    :style="gridStyle"
    @pointerdown="onCanvasPointerDown"
    @pointermove="onCanvasPointerMove"
    @pointerup="onCanvasPointerUp"
    @pointercancel="onCanvasPointerUp"
  >
    <!-- Connections SVG -->
    <svg style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 0;">
      <defs>
        <!-- Arrowhead marker — fill="context-stroke" inherits the path stroke colour -->
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 3.5 L 0 7 L 2.5 3.5 Z" fill="context-stroke" />
        </marker>
      </defs>

      <g v-for="conn in boardConnections" :key="conn.id" style="pointer-events: auto;">
        <!-- Wide invisible hit path: click to delete, pointerdown stopped so canvas doesn't start panning -->
        <path
          :d="connectionPath(conn.from_item_id, conn.to_item_id)"
          fill="none"
          stroke="transparent"
          stroke-width="16"
          pointer-events="stroke"
          style="cursor: pointer;"
          @pointerdown.stop
          @click.stop="connectionsStore.remove(conn.id)"
        />
        <!-- Visible stroke with arrowhead at the to-end -->
        <path
          :d="connectionPath(conn.from_item_id, conn.to_item_id)"
          fill="none"
          stroke="#c4b5fd"
          stroke-width="2"
          stroke-linecap="round"
          marker-end="url(#arrowhead)"
          pointer-events="none"
        />
        <!-- Label: single-click stops propagation (no delete), double-click to edit -->
        <text
          v-if="conn.label"
          :x="getConnectionMidpoint(conn)?.x"
          :y="getConnectionMidpoint(conn)?.y"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="11"
          fill="#9ca3af"
          paint-order="stroke"
          stroke="#f8fafc"
          stroke-width="4"
          stroke-linejoin="round"
          font-family="ui-sans-serif, system-ui, sans-serif"
          pointer-events="all"
          style="cursor: pointer; user-select: none;"
          @click.stop
          @dblclick.stop="startEditLabel(conn)"
        >{{ conn.label }}</text>
      </g>

      <!-- Preview path while in link mode -->
      <path
        v-if="linkMode && linkStartId && previewConnectionPath"
        :d="previewConnectionPath"
        fill="none"
        stroke="#a78bfa"
        stroke-width="2"
        stroke-dasharray="6,4"
        opacity="0.7"
        pointer-events="none"
        marker-end="url(#arrowhead)"
      />
    </svg>

    <!-- World transform layer -->
    <div
      :style="{
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: '0 0',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
      }"
    >
      <!-- Frames (rendered first — behind all content cards) -->
      <CanvasCard
        v-for="item in frameItems"
        :key="item.id"
        :item="item"
        :selected="selectedIds.has(item.id)"
        :is-dragging="isItemDragging(item.id)"
        @pointerdown="onCardPointerDown($event, item.id)"
        @select="onCardSelect($event, item.id)"
        @remove="removeItem(item.id)"
        @update-note="canvasItemsStore.updateNote(item.id, $event)"
      />
      <!-- Content cards (rendered on top of frames) -->
      <CanvasCard
        v-for="item in contentItems"
        :key="item.id"
        :item="item"
        :task="item.task_id ? tasksStore.getTaskById(item.task_id) ?? undefined : undefined"
        :document="item.document_id ? documentsStore.getById(item.document_id) ?? undefined : undefined"
        :selected="selectedIds.has(item.id)"
        :is-dragging="isItemDragging(item.id)"
        :style="linkMode && linkStartId === item.id ? { outline: '2px solid #a78bfa', outlineOffset: '2px', borderRadius: '12px' } : {}"
        @pointerdown="onCardPointerDown($event, item.id)"
        @select="onCardSelect($event, item.id)"
        @remove="removeItem(item.id)"
        @update-note="canvasItemsStore.updateNote(item.id, $event)"
        @change-color="canvasItemsStore.updateColor(item.id, $event)"
      />
    </div>

    <!-- Empty state -->
    <div v-if="loaded && boardItems.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="text-center">
        <p class="text-neutral-300 dark:text-neutral-700 text-sm">Click <strong class="font-medium">Add</strong> to place tasks, documents, or notes</p>
      </div>
    </div>
  </div>

  <!-- Floating toolbar — resize / layer / group controls -->
  <Transition name="fade">
    <div
      v-if="toolbarStyle"
      class="fixed z-30 flex items-center gap-px px-1.5 py-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 -translate-x-1/2"
      :style="toolbarStyle"
    >
      <!-- S/M/L snap for non-shape single items -->
      <template v-if="resizableSelected">
        <button
          v-for="size in RESIZE_SIZES"
          :key="size.label"
          type="button"
          class="w-7 h-6 text-xs rounded font-semibold transition-colors"
          :class="getResizeActiveLabel() === size.label
            ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
          @click="resizeSelected(size.w, size.h)"
        >{{ size.label }}</button>
        <span class="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />
      </template>
      <!-- Layer ordering for any single non-frame item -->
      <template v-if="singleSelected && singleSelected.item_type !== 'frame'">
        <button
          type="button"
          class="w-7 h-6 flex items-center justify-center rounded transition-colors text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          title="Bring to front (⌘])"
          @click="canvasItemsStore.bringToFront(singleSelected!.id)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9h8M2 6h8M4 3h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        </button>
        <button
          type="button"
          class="w-7 h-6 flex items-center justify-center rounded transition-colors text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          title="Send to back (⌘[)"
          @click="canvasItemsStore.sendToBack(singleSelected!.id)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M2 6h8M4 9h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        </button>
        <span v-if="showGroupAction || showUngroupAction" class="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />
      </template>
      <button
        v-if="showGroupAction"
        type="button"
        class="px-2 h-6 text-xs rounded font-medium transition-colors text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        @click="groupSelected"
      >Group</button>
      <button
        v-if="showUngroupAction"
        type="button"
        class="px-2 h-6 text-xs rounded font-medium transition-colors text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        @click="ungroupSelected"
      >Ungroup</button>
    </div>
  </Transition>

  <!-- Link handles — 4 edge dots for the single selected card -->
  <div
    v-for="handle in linkHandlePositions"
    :key="handle.key"
    class="fixed z-30 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 hover:border-purple-500 dark:hover:border-purple-400 hover:scale-125 cursor-crosshair transition-[border-color,transform] shadow-sm"
    :style="{ left: `${handle.x}px`, top: `${handle.y}px` }"
    @pointerdown.stop
    @click.stop="startLinkFrom(linkHandleItem!.id)"
  />

  <!-- Shape resize handles — 4 corners for selected rect/ellipse -->
  <div
    v-for="handle in shapeResizeHandles"
    :key="handle.corner"
    class="fixed z-30 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white dark:bg-neutral-900 border-2 border-purple-400 dark:border-purple-500 shadow-sm"
    :class="(handle.corner === 'tr' || handle.corner === 'bl') ? 'cursor-nesw-resize' : 'cursor-nwse-resize'"
    :style="{ left: `${handle.x}px`, top: `${handle.y}px` }"
    @pointerdown.stop="onShapeResizeHandlePointerDown($event, handle.corner)"
  />

  <!-- Sidebar drag ghost preview -->
  <div
    v-if="ghostScreenPos && ghostDragType"
    class="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-70"
    :style="{ left: `${ghostScreenPos.x}px`, top: `${ghostScreenPos.y}px` }"
  >
    <div v-if="ghostDragType === 'rect'" class="w-12 h-12 rounded-xl border-2 border-purple-400 bg-purple-100/50 dark:bg-purple-900/30" />
    <div v-else-if="ghostDragType === 'ellipse'" class="w-12 h-12 rounded-full border-2 border-purple-400 bg-purple-100/50 dark:bg-purple-900/30" />
    <div v-else-if="ghostDragType === 'frame'" class="w-24 h-16 rounded-xl border-2 border-dashed border-purple-400" />
    <div v-else-if="ghostDragType === 'note'" class="w-12 h-12 rounded-xl border-2 border-purple-400 bg-yellow-200/80 dark:bg-yellow-900/50" />
    <div v-else-if="ghostDragType === 'text'" class="px-2 py-1 text-sm font-semibold text-purple-500 border border-purple-300 rounded bg-white/80 dark:bg-neutral-900/80">T</div>
  </div>

  <!-- Connection label edit input -->
  <Transition name="fade">
    <div
      v-if="editLabelPos"
      class="fixed z-30 -translate-x-1/2 -translate-y-1/2"
      :style="{ left: `${editLabelPos.x}px`, top: `${editLabelPos.y}px` }"
    >
      <input
        ref="connLabelInputRef"
        type="text"
        class="px-2 py-1 text-xs rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none text-center min-w-[80px] max-w-[200px]"
        :value="editingConnectionLabel"
        placeholder="Label…"
        @input="editingConnectionLabel = ($event.target as HTMLInputElement).value"
        @blur="commitConnectionLabel"
        @keydown.enter.prevent="commitConnectionLabel"
        @keydown.escape.prevent="editingConnectionId = null"
        @click.stop
        @pointerdown.stop
      />
    </div>
  </Transition>

  <!-- Lasso selection rect -->
  <div
    v-if="lassoState?.active"
    class="fixed pointer-events-none z-10 border-2 border-purple-400 border-dashed bg-purple-400/10 rounded"
    :style="{
      left: `${Math.min(lassoState.startX, lassoState.currentX)}px`,
      top: `${Math.min(lassoState.startY, lassoState.currentY)}px`,
      width: `${Math.abs(lassoState.currentX - lassoState.startX)}px`,
      height: `${Math.abs(lassoState.currentY - lassoState.startY)}px`,
    }"
  />

  <!-- Add panel -->
  <Transition name="slide-right">
    <div
      v-if="showAddPanel"
      class="fixed right-0 top-0 bottom-0 z-20 w-72 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl"
    >
      <!-- Panel header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Add to board</span>
        <button type="button" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" @click="showAddPanel = false">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-neutral-100 dark:border-neutral-800">
        <button
          v-for="tab in (['task', 'document'] as const)"
          :key="tab"
          type="button"
          class="flex-1 py-2 text-xs font-medium capitalize transition-colors"
          :class="activeTab === tab
            ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500 dark:border-purple-400'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'"
          @click="activeTab = tab"
        >{{ tab === 'document' ? 'Docs' : 'Tasks' }}</button>
      </div>

      <!-- Tasks tab — hierarchical -->
      <div v-if="activeTab === 'task'" class="flex flex-col flex-1 min-h-0">
        <!-- Breadcrumb -->
        <div v-if="taskDrill.type !== 'root'" class="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            class="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            @click="taskDrill = { type: 'root' }"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L3 6l5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back
          </button>
          <span class="text-xs text-neutral-500 dark:text-neutral-400 truncate">{{ taskDrillBreadcrumb }}</span>
        </div>

        <!-- Root level: Inbox + Projects -->
        <div v-if="taskDrill.type === 'root'" class="flex-1 overflow-y-auto">
          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-50 dark:border-neutral-800/50"
            @click="taskDrill = { type: 'inbox' }"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-neutral-400 flex-shrink-0">
              <path d="M2 9h2.5l1 2h5l1-2H14M2 9V4a1 1 0 011-1h8a1 1 0 011 1v5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-sm text-neutral-700 dark:text-neutral-300 flex-1">Inbox</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="text-neutral-300 dark:text-neutral-600"><path d="M3 1.5L7 5l-4 3.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button
            v-for="project in projectsStore.sortedProjects"
            :key="project.id"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-50 dark:border-neutral-800/50"
            @click="taskDrill = { type: 'project', projectId: project.id, projectName: project.name }"
          >
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ backgroundColor: getColorHex(project.color_tag) ?? '#d4d4d4' }"
            />
            <span class="text-sm text-neutral-700 dark:text-neutral-300 flex-1 truncate">{{ project.name }}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="text-neutral-300 dark:text-neutral-600"><path d="M3 1.5L7 5l-4 3.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <p v-if="projectsStore.sortedProjects.length === 0" class="px-4 py-6 text-xs text-neutral-400 dark:text-neutral-600 text-center">No projects yet</p>
        </div>

        <!-- Task list for inbox / project / subtask level -->
        <div v-else class="flex-1 overflow-y-auto">
          <div
            v-for="task in currentDrillTasks"
            :key="task.id"
            class="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <button
              type="button"
              class="flex-1 flex items-center gap-2 text-left min-w-0"
              @click="onDrillTaskClick(task)"
            >
              <span
                class="w-2 h-2 rounded-full flex-shrink-0 border"
                :style="{ backgroundColor: taskProjectColor(task.id) ?? 'transparent', borderColor: taskProjectColor(task.id) ?? '#d4d4d4' }"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1">{{ task.title }}</span>
              <!-- Arrow if has children -->
              <svg v-if="taskHasChildren(task.id)" width="10" height="10" viewBox="0 0 10 10" fill="none" class="text-neutral-300 dark:text-neutral-600 flex-shrink-0"><path d="M3 1.5L7 5l-4 3.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <!-- Always-visible add button -->
            <button
              type="button"
              class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 rounded transition-colors"
              title="Add to board"
              @click.stop="addTask(task.id)"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <p v-if="currentDrillTasks.length === 0" class="px-4 py-6 text-xs text-neutral-400 dark:text-neutral-600 text-center">
            No tasks here
          </p>
        </div>
      </div>

      <!-- Documents tab -->
      <div v-else-if="activeTab === 'document'" class="flex flex-col flex-1 min-h-0">
        <div class="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
          <input
            v-model="search"
            type="text"
            placeholder="Search documents…"
            class="w-full text-sm bg-transparent outline-none text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="doc in filteredDocs"
            :key="doc.id"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-50 dark:border-neutral-800/50"
            @click="addDocument(doc.id)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-neutral-400 flex-shrink-0"><rect x="2" y="1" width="10" height="12" rx="1" stroke="currentColor" stroke-width="1.25"/><path d="M4 5h6M4 7.5h6M4 10h4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>
            <span class="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1">{{ doc.title || 'Untitled' }}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-neutral-300 dark:text-neutral-700 flex-shrink-0"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <p v-if="filteredDocs.length === 0" class="px-4 py-6 text-xs text-neutral-400 dark:text-neutral-600 text-center">
            {{ search ? 'No matching documents' : 'All documents are on the board' }}
          </p>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Click-outside overlay for add panel -->
  <div v-if="showAddPanel" class="fixed inset-0 z-10" @click="showAddPanel = false" />
</template>

<script setup lang="ts">
import { useBoardsStore } from '~/features/canvas/stores/boards'
import { useCanvasItemsStore } from '~/features/canvas/stores/canvas-items'
import { useCanvasConnectionsStore, type CanvasConnection } from '~/features/canvas/stores/canvas-connections'
import { useTasksStore } from '~/stores/tasks'
import { useProjectsStore } from '~/stores/projects'
import { useDocumentsStore } from '~/features/write/stores/documents'
import CanvasCard from '~/features/canvas/components/CanvasCard.vue'
import type { CanvasItem, NoteColor, Task, TaskStatus } from '~/types'
import { getColorHex } from '~/utils/colors'

definePageMeta({ layout: 'canvas' })

const GRID_SIZE = 28 // matches grid dot spacing
const FRAME_DEFAULT_WIDTH = 20 * GRID_SIZE  // 560px — 20 grid units wide
const FRAME_DEFAULT_HEIGHT = 14 * GRID_SIZE // 392px — 14 grid units tall

const RESIZE_SIZES = [
  { label: 'S', w: 5 * GRID_SIZE, h: 5 * GRID_SIZE },   // 140 × 140
  { label: 'M', w: 7 * GRID_SIZE, h: 7 * GRID_SIZE },   // 196 × 196
  { label: 'L', w: 10 * GRID_SIZE, h: 10 * GRID_SIZE }, // 280 × 280
] as const

function snapToGrid(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE
}

const route = useRoute()
const boardsStore = useBoardsStore()
const canvasItemsStore = useCanvasItemsStore()
const connectionsStore = useCanvasConnectionsStore()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const documentsStore = useDocumentsStore()

function taskProjectColor(taskId: string): string | null {
  const ids = projectsStore.getProjectIdsForTask(taskId)
  if (!ids.length) return null
  return getColorHex(projectsStore.getProjectById(ids[0]!)?.color_tag ?? null)
}

const boardId = computed(() => route.params.id as string)
const loaded = ref(false)
const boardTitle = ref('')
const showAddPanel = ref(false)
const activeTab = ref<'task' | 'document'>('task')
const search = ref('')
const selectedNoteColor = ref<NoteColor>('yellow')

// Pan / zoom state
const panX = ref(0)
const panY = ref(0)
const zoom = ref(1)
const canvasRef = ref<HTMLElement | null>(null)
const isPanning = ref(false)
const selectMode = ref(false)
const temporaryPan = ref(false) // true while spacebar held in select mode

type LassoState = {
  startX: number
  startY: number
  currentX: number
  currentY: number
  active: boolean
  pointerId: number
}
const lassoState = ref<LassoState | null>(null)

// Drag state
type DragState = {
  itemId: string
  startPointerX: number
  startPointerY: number
  itemStartPositions: Map<string, { x: number; y: number }>
  pointerId: number
  active: boolean
}
let dragState: DragState | null = null

// Pan state
type PanState = { startPointerX: number; startPointerY: number; startPanX: number; startPanY: number }
let panState: PanState | null = null

// Multi-select
const selectedIds = ref(new Set<string>())

// Link mode
const linkMode = ref(false)
const linkStartId = ref<string | null>(null)
const mouseWorldPos = ref({ x: 0, y: 0 })

const activeTool = computed(() => {
  if (selectMode.value) return 'select'
  return 'pan'
})

// ── Link handles ──────────────────────────────────────────────────────────────
// Four edge-midpoint dots rendered in screen space for the single selected card.
// Clicking one initiates a connection from that card.
const linkHandleItem = computed((): CanvasItem | null => {
  if (linkMode.value || selectedIds.value.size !== 1) return null
  return canvasItemsStore.getById([...selectedIds.value][0]!) ?? null
})

const linkHandlePositions = computed(() => {
  const item = linkHandleItem.value
  if (!item) return []
  const w = item.width ?? (item.item_type === 'frame' ? FRAME_DEFAULT_WIDTH : 200)
  const h = item.height ?? (item.item_type === 'frame' ? FRAME_DEFAULT_HEIGHT : 200)
  const sx = (wx: number) => Math.round(panX.value + wx * zoom.value)
  const sy = (wy: number) => Math.round(panY.value + wy * zoom.value)
  return [
    { key: 'top',    x: sx(item.x + w / 2), y: sy(item.y) },
    { key: 'right',  x: sx(item.x + w),     y: sy(item.y + h / 2) },
    { key: 'bottom', x: sx(item.x + w / 2), y: sy(item.y + h) },
    { key: 'left',   x: sx(item.x),          y: sy(item.y + h / 2) },
  ]
})

// Connection label editing
const editingConnectionId = ref<string | null>(null)
const editingConnectionLabel = ref('')
const connLabelInputRef = ref<HTMLInputElement | null>(null)

// Task hierarchy drill-down
type TaskDrillLevel =
  | { type: 'root' }
  | { type: 'inbox' }
  | { type: 'project'; projectId: string; projectName: string }
  | { type: 'task'; taskId: string; taskTitle: string }
const taskDrill = ref<TaskDrillLevel>({ type: 'root' })

watch(activeTab, () => { taskDrill.value = { type: 'root' } })

const taskDrillBreadcrumb = computed(() => {
  if (taskDrill.value.type === 'inbox') return 'Inbox'
  if (taskDrill.value.type === 'project') return taskDrill.value.projectName
  if (taskDrill.value.type === 'task') return taskDrill.value.taskTitle
  return ''
})

const currentDrillTasks = computed((): Task[] => {
  if (taskDrill.value.type === 'inbox') {
    return tasksStore.tasks.filter(t => {
      if (t.status === 'done' || t.parent_id !== null) return false
      return projectsStore.getProjectIdsForTask(t.id).length === 0
    })
  }
  if (taskDrill.value.type === 'project') {
    const { projectId } = taskDrill.value
    return tasksStore.tasks.filter(t => {
      if (t.status === 'done' || t.parent_id !== null) return false
      return projectsStore.getProjectIdsForTask(t.id).includes(projectId)
    })
  }
  if (taskDrill.value.type === 'task') {
    return tasksStore.getChildTasks(taskDrill.value.taskId).filter(t => t.status !== 'done')
  }
  return []
})

function taskHasChildren(taskId: string): boolean {
  return tasksStore.getChildTasks(taskId).filter(t => t.status !== 'done').length > 0
}

function onDrillTaskClick(task: Task) {
  if (taskHasChildren(task.id)) {
    taskDrill.value = { type: 'task', taskId: task.id, taskTitle: task.title }
  } else {
    addTask(task.id)
  }
}

const boardItems = computed(() => canvasItemsStore.getForBoard(boardId.value))
const frameItems = computed(() => boardItems.value.filter(i => i.item_type === 'frame'))
const contentItems = computed(() =>
  boardItems.value.filter(i => i.item_type !== 'frame').sort((a, b) => a.sort_order - b.sort_order)
)
const boardConnections = computed(() => connectionsStore.getForBoard(boardId.value))

// ── Resize toolbar ────────────────────────────────────────────────────────────
// The toolbar floats above the selected card in screen space.
// Canvas container starts at top-12 (48px). Toolbar appears 40px above the card top edge.
const CANVAS_TOP_PX = 0 // canvas is now fixed inset-0 (full-screen)

const resizableSelected = computed((): CanvasItem | null => {
  if (selectedIds.value.size !== 1) return null
  const id = [...selectedIds.value][0]!
  const item = canvasItemsStore.getById(id)
  if (!item) return null
  if (item.item_type === 'frame') return null
  if (item.item_type === 'rect' || item.item_type === 'ellipse') return null // shapes use corner handles
  if (item.item_type === 'note' && item.note_color === 'none') return null // text cards are content-sized
  return item
})

// Any single selected item (for layer controls + toolbar positioning)
const singleSelected = computed((): CanvasItem | null => {
  if (selectedIds.value.size !== 1) return null
  return canvasItemsStore.getById([...selectedIds.value][0]!) ?? null
})

function getResizeActiveLabel(): string {
  const item = resizableSelected.value
  if (!item) return ''
  const w = item.width
  if (!w || (w > RESIZE_SIZES[0].w && w <= RESIZE_SIZES[1].w + 20)) return 'M'
  if (w <= RESIZE_SIZES[0].w) return 'S'
  return 'L'
}

function resizeSelected(w: number, h: number) {
  for (const id of selectedIds.value) {
    const item = canvasItemsStore.getById(id)
    if (item && item.item_type !== 'frame') {
      canvasItemsStore.updateSize(id, w, h)
    }
  }
}

// ── Grouping ──────────────────────────────────────────────────────────────────
// Given a set of item IDs, expand it to also include all group-mates of any
// item that has a group_id. This ensures clicking/lassoing one group member
// automatically selects the whole group.
function expandWithGroupMembers(ids: Set<string>): Set<string> {
  const expanded = new Set(ids)
  const groupIds = new Set<string>()
  for (const id of ids) {
    const item = canvasItemsStore.getById(id)
    if (item?.group_id) groupIds.add(item.group_id)
  }
  if (groupIds.size === 0) return expanded
  for (const item of boardItems.value) {
    if (item.group_id && groupIds.has(item.group_id)) expanded.add(item.id)
  }
  return expanded
}

const showGroupAction = computed(() => {
  if (selectedIds.value.size < 2) return false
  // All selected items already share one group — "Group" would be a no-op
  const gids = new Set<string | null>()
  for (const id of selectedIds.value) gids.add(canvasItemsStore.getById(id)?.group_id ?? null)
  return !(gids.size === 1 && !gids.has(null))
})

const showUngroupAction = computed(() =>
  [...selectedIds.value].some(id => !!canvasItemsStore.getById(id)?.group_id)
)

const toolbarVisible = computed(() =>
  !!singleSelected.value || showGroupAction.value || showUngroupAction.value
)

// Position toolbar above the bounding box (multi) or item top edge (single).
const toolbarStyle = computed(() => {
  if (!toolbarVisible.value) return null
  if (selectedIds.value.size > 1) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity
    for (const id of selectedIds.value) {
      const item = canvasItemsStore.getById(id)
      if (!item) continue
      minX = Math.min(minX, item.x)
      minY = Math.min(minY, item.y)
      maxX = Math.max(maxX, item.x + (item.width ?? (item.item_type === 'frame' ? FRAME_DEFAULT_WIDTH : 200)))
    }
    const screenX = panX.value + ((minX + maxX) / 2) * zoom.value
    const screenY = panY.value + minY * zoom.value + CANVAS_TOP_PX
    return { left: `${Math.round(screenX)}px`, top: `${Math.round(screenY - 44)}px` }
  }
  const item = singleSelected.value
  if (!item) return null
  const itemW = item.width ?? (item.item_type === 'frame' ? FRAME_DEFAULT_WIDTH : 200)
  const screenX = panX.value + item.x * zoom.value + (itemW * zoom.value) / 2
  const screenY = panY.value + item.y * zoom.value + CANVAS_TOP_PX
  return { left: `${Math.round(screenX)}px`, top: `${Math.round(screenY - 40)}px` }
})

function groupSelected() {
  const ids = [...selectedIds.value]
  if (ids.length >= 2) canvasItemsStore.groupItems(ids)
}

function ungroupSelected() {
  const groupIds = new Set<string>()
  for (const id of selectedIds.value) {
    const gid = canvasItemsStore.getById(id)?.group_id
    if (gid) groupIds.add(gid)
  }
  for (const gid of groupIds) canvasItemsStore.ungroupItems(gid)
}

function isInsideFrame(cx: number, cy: number, frame: CanvasItem): boolean {
  const w = frame.width ?? FRAME_DEFAULT_WIDTH
  const h = frame.height ?? FRAME_DEFAULT_HEIGHT
  return cx >= frame.x && cx <= frame.x + w && cy >= frame.y && cy <= frame.y + h
}

function updateFrameContainment(movedIds: Set<string>): void {
  for (const id of movedIds) {
    const item = canvasItemsStore.getById(id)
    if (!item || item.item_type === 'frame') continue
    const cx = item.x + 100
    const cy = item.y + 100
    // If still inside current frame, keep it
    if (item.frame_id) {
      const currentFrame = canvasItemsStore.getById(item.frame_id)
      if (currentFrame && isInsideFrame(cx, cy, currentFrame)) continue
    }
    // Find the smallest frame that now contains this card
    let newFrameId: string | null = null
    let smallestArea = Infinity
    for (const frame of frameItems.value) {
      if (isInsideFrame(cx, cy, frame)) {
        const area = (frame.width ?? FRAME_DEFAULT_WIDTH) * (frame.height ?? FRAME_DEFAULT_HEIGHT)
        if (area < smallestArea) {
          smallestArea = area
          newFrameId = frame.id
        }
      }
    }
    if (newFrameId !== (item.frame_id ?? null)) {
      canvasItemsStore.updateFrameId(id, newFrameId)
    }
  }
}

const gridStyle = computed(() => ({
  backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
  backgroundSize: `${28 * zoom.value}px ${28 * zoom.value}px`,
  backgroundPosition: `${panX.value}px ${panY.value}px`,
}))

onMounted(async () => {
  await Promise.all([
    boardsStore.fetchAll(),
    canvasItemsStore.fetchForBoard(boardId.value),
    connectionsStore.fetchForBoard(boardId.value),
    tasksStore.fetchTasks(),
    documentsStore.fetchAll(),
  ])
  const board = boardsStore.getById(boardId.value)
  if (board) boardTitle.value = board.title
  loaded.value = true

  canvasRef.value?.addEventListener('wheel', onWheel, { passive: false })
  canvasRef.value?.addEventListener('touchstart', onTouchStart, { passive: true })
  canvasRef.value?.addEventListener('touchmove', onTouchMove, { passive: false })
  canvasRef.value?.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('paste', onPaste)
})

onUnmounted(() => {
  canvasRef.value?.removeEventListener('wheel', onWheel)
  canvasRef.value?.removeEventListener('touchstart', onTouchStart)
  canvasRef.value?.removeEventListener('touchmove', onTouchMove)
  canvasRef.value?.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('paste', onPaste as EventListener)
})

// ── Wheel zoom ──────────────────────────────────────────────────────────────
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
  applyZoom(factor, e.clientX, e.clientY)
}

function applyZoom(factor: number, cx: number, cy: number) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  const localX = cx - rect.left
  const localY = cy - rect.top
  const newZoom = Math.max(0.15, Math.min(4, zoom.value * factor))
  panX.value = localX - (localX - panX.value) * (newZoom / zoom.value)
  panY.value = localY - (localY - panY.value) * (newZoom / zoom.value)
  zoom.value = newZoom
}

function adjustZoom(factor: number) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  applyZoom(factor, rect.left + rect.width / 2, rect.top + rect.height / 2)
}

function resetView() {
  panX.value = 0
  panY.value = 0
  zoom.value = 1
}

function isItemDragging(itemId: string): boolean {
  return !!dragState && dragState.itemStartPositions.has(itemId)
}

function startLinkFrom(itemId: string) {
  linkMode.value = true
  linkStartId.value = itemId
  selectMode.value = false
  selectedIds.value = new Set()
}

// ── Link mode ─────────────────────────────────────────────────────────────────
function toggleLinkMode() {
  linkMode.value = !linkMode.value
  linkStartId.value = null
  if (linkMode.value) showAddPanel.value = false
}

// ── Pointer events on canvas background ──────────────────────────────────────
function onCanvasPointerDown(e: PointerEvent) {
  if ((e.target as HTMLElement).closest('[data-card]')) return
  if (linkMode.value) {
    linkStartId.value = null
    return
  }
  if (selectMode.value && !temporaryPan.value) {
    // Start lasso selection
    selectedIds.value = new Set()
    lassoState.value = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      active: false,
      pointerId: e.pointerId,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    return
  }
  selectedIds.value = new Set()
  panState = {
    startPointerX: e.clientX,
    startPointerY: e.clientY,
    startPanX: panX.value,
    startPanY: panY.value,
  }
  isPanning.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onCanvasPointerMove(e: PointerEvent) {
  if (lassoState.value) {
    const ddx = e.clientX - lassoState.value.startX
    const ddy = e.clientY - lassoState.value.startY
    if (!lassoState.value.active && ddx * ddx + ddy * ddy > 16) {
      lassoState.value.active = true
    }
    lassoState.value.currentX = e.clientX
    lassoState.value.currentY = e.clientY
    return
  }

  // Always track mouse for link preview
  if (linkMode.value) {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (rect) {
      mouseWorldPos.value = {
        x: (e.clientX - rect.left - panX.value) / zoom.value,
        y: (e.clientY - rect.top - panY.value) / zoom.value,
      }
    }
    return
  }

  if (dragState) {
    if (!dragState.active) {
      const ddx = e.clientX - dragState.startPointerX
      const ddy = e.clientY - dragState.startPointerY
      if (ddx * ddx + ddy * ddy < 9) return
      dragState.active = true
      canvasRef.value?.setPointerCapture(dragState.pointerId)
    }
    const dx = (e.clientX - dragState.startPointerX) / zoom.value
    const dy = (e.clientY - dragState.startPointerY) / zoom.value
    for (const [id, start] of dragState.itemStartPositions) {
      canvasItemsStore.moveLocal(id, start.x + dx, start.y + dy)
    }
    return
  }
  if (panState) {
    panX.value = panState.startPanX + (e.clientX - panState.startPointerX)
    panY.value = panState.startPanY + (e.clientY - panState.startPointerY)
  }
}

function commitLasso() {
  if (!lassoState.value?.active || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x1 = (Math.min(lassoState.value.startX, lassoState.value.currentX) - rect.left - panX.value) / zoom.value
  const y1 = (Math.min(lassoState.value.startY, lassoState.value.currentY) - rect.top - panY.value) / zoom.value
  const x2 = (Math.max(lassoState.value.startX, lassoState.value.currentX) - rect.left - panX.value) / zoom.value
  const y2 = (Math.max(lassoState.value.startY, lassoState.value.currentY) - rect.top - panY.value) / zoom.value
  const newSelected = new Set<string>()
  for (const item of boardItems.value) {
    const cx = item.x + (item.item_type === 'frame' ? (item.width ?? FRAME_DEFAULT_WIDTH) : (item.width ?? 200)) / 2
    const cy = item.y + (item.item_type === 'frame' ? (item.height ?? FRAME_DEFAULT_HEIGHT) : (item.height ?? 200)) / 2
    if (cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2) {
      newSelected.add(item.id)
    }
  }
  selectedIds.value = expandWithGroupMembers(newSelected)
}

function onCanvasPointerUp(_e: PointerEvent) {
  if (lassoState.value) {
    if (lassoState.value.active) commitLasso()
    lassoState.value = null
    return
  }
  if (dragState) {
    const movedIds = new Set(dragState.itemStartPositions.keys())
    for (const id of movedIds) {
      const item = canvasItemsStore.getById(id)
      if (item) {
        const sx = snapToGrid(item.x)
        const sy = snapToGrid(item.y)
        canvasItemsStore.moveLocal(id, sx, sy)
        canvasItemsStore.updatePosition(id, sx, sy)
      }
    }
    updateFrameContainment(movedIds)
    dragState = null
  }
  panState = null
  isPanning.value = false
}

// ── Pointer events on cards ──────────────────────────────────────────────────
function onCardPointerDown(e: PointerEvent, itemId: string) {
  if (linkMode.value) return

  if (!selectedIds.value.has(itemId)) {
    selectedIds.value = new Set([itemId])
  }

  // Include frame contents and group members in the drag
  const ids = new Set([...selectedIds.value])
  for (const id of [...selectedIds.value]) {
    const it = canvasItemsStore.getById(id)
    if (it?.item_type === 'frame') {
      boardItems.value.filter(i => i.frame_id === id).forEach(i => ids.add(i.id))
    }
    if (it?.group_id) {
      boardItems.value.filter(i => i.group_id === it.group_id).forEach(i => ids.add(i.id))
    }
  }

  const startPositions = new Map(
    [...ids].map(id => {
      const item = canvasItemsStore.getById(id)
      return [id, { x: item?.x ?? 0, y: item?.y ?? 0 }]
    })
  )

  dragState = {
    itemId,
    startPointerX: e.clientX,
    startPointerY: e.clientY,
    itemStartPositions: startPositions,
    pointerId: e.pointerId,
    active: false,
  }
}

function onCardSelect(e: MouseEvent, itemId: string) {
  if (linkMode.value) {
    if (!linkStartId.value) {
      linkStartId.value = itemId
    } else if (linkStartId.value !== itemId) {
      connectionsStore.add(linkStartId.value, itemId, boardId.value)
      linkStartId.value = null
    } else {
      linkStartId.value = null // clicked same card, cancel
    }
    return
  }

  if (e.shiftKey) {
    const next = new Set(selectedIds.value)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    selectedIds.value = expandWithGroupMembers(next)
  } else {
    selectedIds.value = expandWithGroupMembers(new Set([itemId]))
  }
}

// ── Bezier connections ────────────────────────────────────────────────────────
// Paths are in canvas (screen) space so they work with the full-viewport SVG.
function getItemScreenCenter(itemId: string): { x: number; y: number } | null {
  const item = canvasItemsStore.getById(itemId)
  if (!item) return null
  const halfW = item.item_type === 'frame' ? (item.width ?? FRAME_DEFAULT_WIDTH) / 2 : (item.width ?? 200) / 2
  const halfH = item.item_type === 'frame' ? (item.height ?? FRAME_DEFAULT_HEIGHT) / 2 : (item.height ?? 200) / 2
  return {
    x: panX.value + (item.x + halfW) * zoom.value,
    y: panY.value + (item.y + halfH) * zoom.value,
  }
}

// ── Connection label editing ──────────────────────────────────────────────────
function getConnectionMidpoint(conn: CanvasConnection): { x: number; y: number } | null {
  const from = getItemScreenCenter(conn.from_item_id)
  const to = getItemScreenCenter(conn.to_item_id)
  if (!from || !to) return null
  // For our cubic bezier (cp1y=from.y, cp2y=to.y), the t=0.5 midpoint is exactly
  // the average of the endpoints in both x and y.
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
}

const editLabelPos = computed(() => {
  if (!editingConnectionId.value) return null
  const conn = connectionsStore.connections.find(c => c.id === editingConnectionId.value)
  if (!conn) return null
  return getConnectionMidpoint(conn)
})

function startEditLabel(conn: CanvasConnection) {
  editingConnectionId.value = conn.id
  editingConnectionLabel.value = conn.label ?? ''
  nextTick(() => connLabelInputRef.value?.focus())
}

function commitConnectionLabel() {
  if (!editingConnectionId.value) return
  connectionsStore.updateLabel(editingConnectionId.value, editingConnectionLabel.value.trim())
  editingConnectionId.value = null
}

function connectionPath(fromId: string, toId: string): string {
  const from = getItemScreenCenter(fromId)
  const to = getItemScreenCenter(toId)
  if (!from || !to) return ''
  const dx = to.x - from.x
  const cp1x = from.x + dx * 0.5
  const cp2x = to.x - dx * 0.5
  return `M ${from.x} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x} ${to.y}`
}

const previewConnectionPath = computed(() => {
  if (!linkStartId.value) return ''
  const from = getItemScreenCenter(linkStartId.value)
  if (!from) return ''
  const to = {
    x: panX.value + mouseWorldPos.value.x * zoom.value,
    y: panY.value + mouseWorldPos.value.y * zoom.value,
  }
  const dx = to.x - from.x
  const cp1x = from.x + dx * 0.5
  const cp2x = to.x - dx * 0.5
  return `M ${from.x} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x} ${to.y}`
})

// ── Pinch-to-zoom (touch) ────────────────────────────────────────────────────
let lastPinchDist = 0

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) lastPinchDist = 0
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length !== 2) return
  e.preventDefault()
  const t1 = e.touches[0]!
  const t2 = e.touches[1]!
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (lastPinchDist > 0) {
    const cx = (t1.clientX + t2.clientX) / 2
    const cy = (t1.clientY + t2.clientY) / 2
    applyZoom(dist / lastPinchDist, cx, cy)
  }
  lastPinchDist = dist
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) lastPinchDist = 0
}

// ── Remove item (also cleans up connections) ──────────────────────────────────
function removeItem(itemId: string) {
  // If removing a frame, clear frame_id on all contained items locally
  const item = canvasItemsStore.getById(itemId)
  if (item?.item_type === 'frame') {
    boardItems.value
      .filter(i => i.frame_id === itemId)
      .forEach(i => canvasItemsStore.updateFrameId(i.id, null))
  }
  connectionsStore.removeForItem(itemId)
  canvasItemsStore.remove(itemId)
}

// ── Shape corner resize ───────────────────────────────────────────────────────
// Corner drag handles for rect/ellipse items, rendered in screen space.
type ShapeResizeState = {
  itemId: string
  corner: 'tl' | 'tr' | 'bl' | 'br'
  startPointerX: number
  startPointerY: number
  startW: number
  startH: number
  startX: number
  startY: number
}
let shapeResizeState: ShapeResizeState | null = null

const shapeResizeItem = computed((): CanvasItem | null => {
  if (linkMode.value) return null
  if (selectedIds.value.size !== 1) return null
  const item = canvasItemsStore.getById([...selectedIds.value][0]!)
  if (!item) return null
  return item.item_type === 'rect' || item.item_type === 'ellipse' ? item : null
})

const shapeResizeHandles = computed(() => {
  const item = shapeResizeItem.value
  if (!item) return []
  const w = item.width ?? 196
  const h = item.height ?? 196
  const sx = (wx: number) => Math.round(panX.value + wx * zoom.value)
  const sy = (wy: number) => Math.round(panY.value + wy * zoom.value)
  return [
    { corner: 'tl' as const, x: sx(item.x),     y: sy(item.y) },
    { corner: 'tr' as const, x: sx(item.x + w),  y: sy(item.y) },
    { corner: 'bl' as const, x: sx(item.x),      y: sy(item.y + h) },
    { corner: 'br' as const, x: sx(item.x + w),  y: sy(item.y + h) },
  ]
})

function onShapeResizeHandlePointerDown(e: PointerEvent, corner: 'tl' | 'tr' | 'bl' | 'br') {
  e.stopPropagation()
  const item = shapeResizeItem.value
  if (!item) return
  shapeResizeState = {
    itemId: item.id,
    corner,
    startPointerX: e.clientX,
    startPointerY: e.clientY,
    startW: item.width ?? 196,
    startH: item.height ?? 196,
    startX: item.x,
    startY: item.y,
  }
  window.addEventListener('pointermove', onShapeResizeMove)
  window.addEventListener('pointerup', onShapeResizeUp, { once: true })
}

function onShapeResizeMove(e: PointerEvent) {
  if (!shapeResizeState) return
  const dx = (e.clientX - shapeResizeState.startPointerX) / zoom.value
  const dy = (e.clientY - shapeResizeState.startPointerY) / zoom.value
  const { startW, startH, startX, startY, corner } = shapeResizeState
  let newW = startW, newH = startH, newX = startX, newY = startY
  if (corner === 'br') {
    newW = Math.max(GRID_SIZE, startW + dx)
    newH = Math.max(GRID_SIZE, startH + dy)
  } else if (corner === 'bl') {
    newW = Math.max(GRID_SIZE, startW - dx)
    newH = Math.max(GRID_SIZE, startH + dy)
    newX = startX + (startW - newW)
  } else if (corner === 'tr') {
    newW = Math.max(GRID_SIZE, startW + dx)
    newH = Math.max(GRID_SIZE, startH - dy)
    newY = startY + (startH - newH)
  } else {
    newW = Math.max(GRID_SIZE, startW - dx)
    newH = Math.max(GRID_SIZE, startH - dy)
    newX = startX + (startW - newW)
    newY = startY + (startH - newH)
  }
  canvasItemsStore.moveLocal(shapeResizeState.itemId, newX, newY)
  canvasItemsStore.sizeLocal(shapeResizeState.itemId, newW, newH)
}

function onShapeResizeUp() {
  window.removeEventListener('pointermove', onShapeResizeMove)
  if (!shapeResizeState) return
  const item = canvasItemsStore.getById(shapeResizeState.itemId)
  if (item) {
    const sx = snapToGrid(item.x)
    const sy = snapToGrid(item.y)
    const sw = Math.max(GRID_SIZE, snapToGrid(item.width ?? 196))
    const sh = Math.max(GRID_SIZE, snapToGrid(item.height ?? 196))
    canvasItemsStore.moveLocal(shapeResizeState.itemId, sx, sy)
    canvasItemsStore.updatePosition(shapeResizeState.itemId, sx, sy)
    canvasItemsStore.sizeLocal(shapeResizeState.itemId, sw, sh)
    canvasItemsStore.updateSize(shapeResizeState.itemId, sw, sh)
  }
  shapeResizeState = null
}

// ── Sidebar drag-to-canvas ────────────────────────────────────────────────────
// Dragging a tool button from the sidebar drops the item at the cursor position.
// A minimal move from pointerdown is treated as a click → place at canvas centre.
type SidebarDragType = 'frame' | 'rect' | 'ellipse' | 'note' | 'text'

type PlaceDragState = {
  type: SidebarDragType
  startPointerX: number
  startPointerY: number
}
let placeDragState: PlaceDragState | null = null
const ghostScreenPos = ref<{ x: number; y: number } | null>(null)
const ghostDragType = ref<SidebarDragType | null>(null)

function onSidebarToolPointerDown(e: PointerEvent, type: SidebarDragType) {
  e.stopPropagation()
  placeDragState = { type, startPointerX: e.clientX, startPointerY: e.clientY }
  ghostDragType.value = type
  ghostScreenPos.value = { x: e.clientX, y: e.clientY }
  window.addEventListener('pointermove', onPlaceDragMove)
  window.addEventListener('pointerup', onPlaceDragUp, { once: true })
}

function onPlaceDragMove(e: PointerEvent) {
  if (!placeDragState) return
  ghostScreenPos.value = { x: e.clientX, y: e.clientY }
}

async function onPlaceDragUp(e: PointerEvent) {
  window.removeEventListener('pointermove', onPlaceDragMove)
  if (!placeDragState) return
  const { type, startPointerX, startPointerY } = placeDragState
  placeDragState = null
  ghostScreenPos.value = null
  ghostDragType.value = null

  const dx = e.clientX - startPointerX
  const dy = e.clientY - startPointerY
  const moved = dx * dx + dy * dy > 100

  if (moved) {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    const x = snapToGrid((e.clientX - rect.left - panX.value) / zoom.value)
    const y = snapToGrid((e.clientY - rect.top - panY.value) / zoom.value)
    await placeItemAt(type, x, y)
  } else {
    const pos = centerWorldPos()
    await placeItemAt(type, pos.x, pos.y)
  }
}

async function placeItemAt(type: SidebarDragType, x: number, y: number) {
  if (type === 'frame') {
    await canvasItemsStore.add({
      board_id: boardId.value, item_type: 'frame', note_text: 'Frame', note_color: 'none',
      width: FRAME_DEFAULT_WIDTH, height: FRAME_DEFAULT_HEIGHT,
      x: x - FRAME_DEFAULT_WIDTH / 2, y: y - FRAME_DEFAULT_HEIGHT / 2,
    })
  } else if (type === 'rect') {
    await canvasItemsStore.add({
      board_id: boardId.value, item_type: 'rect', note_text: '', note_color: 'none',
      width: 7 * GRID_SIZE, height: 7 * GRID_SIZE,
      x: x - 3 * GRID_SIZE, y: y - 3 * GRID_SIZE,
    })
  } else if (type === 'ellipse') {
    await canvasItemsStore.add({
      board_id: boardId.value, item_type: 'ellipse', note_text: '', note_color: 'none',
      width: 7 * GRID_SIZE, height: 7 * GRID_SIZE,
      x: x - 3 * GRID_SIZE, y: y - 3 * GRID_SIZE,
    })
  } else if (type === 'note') {
    await canvasItemsStore.add({
      board_id: boardId.value, item_type: 'note', note_text: '', note_color: selectedNoteColor.value, x, y,
    })
  } else {
    await canvasItemsStore.add({
      board_id: boardId.value, item_type: 'note', note_text: '', note_color: 'none', x, y,
    })
  }
}

// ── Keyboard ──────────────────────────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  const el = document.activeElement
  const isEditing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement)?.isContentEditable
  if (isEditing) return
  if (e.key === ' ' && selectMode.value && !temporaryPan.value) {
    temporaryPan.value = true
    e.preventDefault()
    return
  }
  if (e.key === 'Escape' && linkMode.value) {
    toggleLinkMode()
    return
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
    e.preventDefault()
    if (e.shiftKey) ungroupSelected()
    else groupSelected()
    return
  }
  // Layer ordering: Cmd+] bring to front, Cmd+[ send to back
  if ((e.metaKey || e.ctrlKey) && (e.key === ']' || e.key === '[')) {
    e.preventDefault()
    const item = singleSelected.value
    if (item && item.item_type !== 'frame') {
      if (e.key === ']') canvasItemsStore.bringToFront(item.id)
      else canvasItemsStore.sendToBack(item.id)
    }
    return
  }
  if ((e.key === 'Backspace' || e.key === 'Delete') && selectedIds.value.size > 0) {
    e.preventDefault()
    for (const id of selectedIds.value) removeItem(id)
    selectedIds.value = new Set()
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === ' ') temporaryPan.value = false
}

// ── Image paste ───────────────────────────────────────────────────────────────
const supabase = useSupabaseClient()

async function onPaste(e: Event) {
  const clipItems = (e as ClipboardEvent).clipboardData?.items
  if (!clipItems) return
  for (const item of Array.from(clipItems) as DataTransferItem[]) {
    if (!item.type.startsWith('image/')) continue
    const blob = item.getAsFile()
    if (!blob) continue
    const authStore = useAuthStore()
    const ext = item.type.split('/')[1] ?? 'png'
    const path = `${authStore.user!.id}/${Date.now()}.${ext}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).storage.from('canvas-images').upload(path, blob, { contentType: item.type })
    if (error) { console.error('Image upload failed:', error.message); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (supabase as any).storage.from('canvas-images').getPublicUrl(data.path)
    const pos = centerWorldPos()
    await canvasItemsStore.add({ board_id: boardId.value, item_type: 'image', image_url: urlData.publicUrl, x: pos.x, y: pos.y })
    break
  }
}

// ── Board title ──────────────────────────────────────────────────────────────
function saveTitle() {
  const board = boardsStore.getById(boardId.value)
  if (!board || boardTitle.value === board.title) return
  boardsStore.updateTitle(boardId.value, boardTitle.value || 'Untitled board')
}

// ── Add items ────────────────────────────────────────────────────────────────
function centerWorldPos() {
  const el = canvasRef.value
  if (!el) return { x: 200, y: 200 }
  const cx = el.clientWidth / 2
  const cy = el.clientHeight / 2
  const offset = boardItems.value.length * GRID_SIZE
  return {
    x: snapToGrid((cx - panX.value) / zoom.value - 100 + offset),
    y: snapToGrid((cy - panY.value) / zoom.value - 100 + offset),
  }
}

async function addTask(taskId: string) {
  const pos = centerWorldPos()
  await canvasItemsStore.add({
    board_id: boardId.value,
    item_type: 'task',
    task_id: taskId,
    x: pos.x,
    y: pos.y,
  })
}

async function addDocument(documentId: string) {
  const pos = centerWorldPos()
  await canvasItemsStore.add({
    board_id: boardId.value,
    item_type: 'document',
    document_id: documentId,
    x: pos.x,
    y: pos.y,
  })
  search.value = ''
}

// ── Filtered add-panel lists ──────────────────────────────────────────────────
const filteredDocs = computed(() => {
  const term = search.value.toLowerCase()
  return documentsStore.documents.filter(d => {
    if (canvasItemsStore.documentOnBoard(boardId.value, d.id)) return false
    if (term && !(d.title || '').toLowerCase().includes(term)) return false
    return true
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function taskStatusColor(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    todo: '#d4d4d4',
    in_progress: '#a78bfa',
    orbit: '#94a3b8',
    done: '#4ade80',
  }
  return map[status]
}

// keep unused var from erroring
void taskStatusColor

watch(showAddPanel, (val) => { if (!val) search.value = '' })

useHead(computed(() => ({ title: boardTitle.value || 'Board' })))
</script>

<style>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
