<script lang="ts">
	import { columnStats } from '$lib/stores/boardStore';

	export let columnId: string;

	$: stats = $columnStats.find((s) => s.columnId === columnId);
</script>

{#if stats}
	<div class="mt-2 text-sm text-gray-500">
		<div class="flex items-center gap-2">
			<div class="h-2 w-full rounded-full bg-gray-200">
				<div
					class="h-2 rounded-full bg-green-500 transition-all duration-300"
					style="width: {stats.percentage}%"
				></div>
			</div>
			<span class="whitespace-nowrap">
				{stats.completed}/{stats.total}
			</span>
		</div>
	</div>
{/if}
