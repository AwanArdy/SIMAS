<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <label for="month-filter" class="flex items-center gap-1.5 text-sm font-medium text-slate-600">
      <svg class="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591c-1.735 1.735-3.914 4.17-3.914 6.591v.781a4.5 4.5 0 01-1.03 2.86l-.31.38a2.25 2.25 0 01-3.494 0l-.31-.38a4.5 4.5 0 01-1.03-2.86v-.781c0-2.421-2.179-4.856-3.914-6.591A2.25 2.25 0 015 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
      Filter bulan
    </label>
    <input id="month-filter" v-model="model" type="month" class="input w-auto" />
    <button
      v-if="model"
      type="button"
      class="action-btn text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      @click="model = ''"
    >
      Reset
    </button>
  </div>
</template>
