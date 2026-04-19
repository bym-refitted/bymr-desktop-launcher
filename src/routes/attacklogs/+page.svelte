<script lang="ts">
  import { Method } from '$lib/enums/Method';
  import { user } from '$lib/stores/userStore';
  import { invokeApiRequest } from '$lib/utils/invokeApiRequest';
  import { Label, RadioGroup, Tooltip } from 'bits-ui';
  import { Notepad, ArrowClockwise, ImageBroken } from 'phosphor-svelte';
  import { fly } from 'svelte/transition';

  import AlertDialog from '$lib/components/AlertDialog.svelte';

  interface AttackLogs {
    attackLogs: AttackLogDetails[];
  }
  interface AttackLogDetails {
    id: number;
    attacker_userid: number;
    attacker_username: string;
    attacker_pic_square: string;
    defender_userid: number;
    defender_username: string;
    defender_pic_square: string;
    type: string;
    x: number;
    y: number;
    loot: Record<string, number>;
    attackreport: string;
    attacktime: Date;
  }

  let attackLogs: AttackLogDetails[] = [];
  let filterType = 'both';

  let imageError = false;
  let viewAttackLogs = false;

  const fetchAttackLogs = async () => {
    if (!$user.token) return;

    try {
      const { data } = await invokeApiRequest<AttackLogs>(
        `/attacklogs?filter=${filterType}`,
        null,
        Method.GET
      );

      if (data.attackLogs && data.attackLogs.length > 0) {
        attackLogs = data.attackLogs;
      }
    } catch (err) {
      console.error('Error fetching attack logs:', err);
    }
  };

  $: if ($user.token && filterType) fetchAttackLogs();

  const isUserAttacker = (log: AttackLogDetails) => $user && log.attacker_userid === $user.userId;

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const attackTime = new Date(date);
    const diffMs = now.getTime() - attackTime.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays >= 2) {
      return `${diffDays} days ago`;
    } else if (diffDays === 1) {
      return `1 day${diffHrs > 0 ? ", " + diffHrs + " hrs" : ""} ago`;
    } else if (diffHrs > 0) {
      return `${diffHrs} hrs${diffMins > 0 ? ", " + diffMins + " mins" : ""} ago`;
    } else {
      return `${diffMins} mins ago`;
    }
  };
</script>

<svelte:head>
  <title>Attack Logs</title>
</svelte:head>

<div class="mb-16 flex justify-start items-start lg:py-16 lg:mt-[6%] lg:py-0">
  <div class="w-full lg:w-3/5 mx-4 lg:ml-[12%] lg:mr-0">
    <!-- Header Section -->
    <div
      class="flex flex-col items-center text-muted-foreground"
      in:fly={{ y: 30, duration: 600, delay: 100 }}
    >
      <h1 class="text-white font-title leading-snug pt-12 text-5xl lg:text-7xl lg:pt-0">
        Attack Logs
      </h1>
    </div>

    <div
      id="attacklogs"
      class="mt-16"
      in:fly={{ y: 30, duration: 600, delay: 200 }}
    >
      <div class="grid grid-cols-1">
        <!-- Filters -->
        <div class="flex flex-row justify-between items-start sm:items-center">
          <RadioGroup.Root
            bind:value={filterType}
            class="flex flex-col sm:flex-row gap-3 sm:gap-4 text-sm font-medium"
          >
            <div class="text-foreground group flex select-none items-center transition-all">
              <RadioGroup.Item
                id="both"
                value="both"
                class="size-5 rounded-[4px] border border-gray-600 bg-gray-800 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
              />
              <Label.Root for="both" class="pl-3 cursor-pointer">Both</Label.Root>
            </div>
            <div class="text-foreground group flex select-none items-center transition-all">
              <RadioGroup.Item
                id="myattacks"
                value="myattacks"
                class="size-5 rounded-[4px] border border-gray-600 bg-gray-800 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
              />
              <Label.Root for="myattacks" class="pl-3 cursor-pointer">My Attacks</Label.Root>
            </div>
            <div class="text-foreground group flex select-none items-center transition-all">
              <RadioGroup.Item
                id="peopleattackingme"
                value="peopleattackingme"
                class="size-5 rounded-[4px] border border-gray-600 bg-gray-800 data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
              />
              <Label.Root for="peopleattackingme" class="pl-3 cursor-pointer">People Attacking Me</Label.Root>
            </div>
          </RadioGroup.Root>

          <!-- Tooltip -->
          <div class="hidden sm:block">
            <Tooltip.Root openDelay={0}>
              <Tooltip.Trigger>
                <div
                  class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  <ArrowClockwise size={20} weight="bold" class="text-primary" />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content side="top" sideOffset={5}>
                <div class="">
                  <Tooltip.Arrow class="rounded-[2px]" />
                </div>
                <div
                  class="flex items-center justify-center rounded-input bg-white/10 rounded-md p-3 text-sm font-medium outline-none"
                >
                  Attack logs are updated every 30 minutes
                </div>
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        </div>

        <!-- Attack Logs Table -->
        <div class="h-full mt-6 bg-gray-800 p-5 relative flex flex-col overflow-hidden rounded-lg">
          {#if attackLogs.length > 0}
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left text-gray-300">
                <thead class="text-xs uppercase bg-gray-700 text-gray-300">
                  <tr>
                    <th scope="col" class="whitespace-nowrap font-display tracking-widest text-1xl px-6 py-3">Profile</th>
                    <th scope="col" class="whitespace-nowrap font-display tracking-widest text-1xl px-6 py-3">Battle</th>
                    <th scope="col" class="whitespace-nowrap font-display tracking-widest text-1xl px-6 py-3">Type</th>
                    <th scope="col" class="whitespace-nowrap font-display tracking-widest text-1xl px-6 py-3">Location</th>
                    <th scope="col" class="whitespace-nowrap font-display tracking-widest text-1xl px-6 py-3">Time</th>
                    <th scope="col" class="whitespace-nowrap font-display tracking-widest text-1xl px-6 py-3">Attack Report</th>
                  </tr>
                </thead>
                <tbody>
                  {#each attackLogs as log}
                    <tr class="border-b bg-gray-800 border-gray-700 hover:bg-gray-700">
                      <td class="whitespace-nowrap px-6 py-4">
                        <div class="flex justify-center">
                          {#if isUserAttacker(log)}
                            {#if log.attacker_pic_square}
                              <img
                                src={log.attacker_pic_square}
                                alt="Your avatar"
                                class="w-10 h-10 rounded-[4px]"
                                on:error={() => (imageError = true)}
                              />
                            {:else}
                              <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                <ImageBroken size={16} />
                              </div>
                            {/if}
                          {:else if log.attacker_pic_square}
                            <img
                              src={log.attacker_pic_square}
                              alt={log.attacker_username}
                              class="w-10 h-10 rounded-[4px]"
                              on:error={() => (imageError = true)}
                            />
                          {:else}
                            <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                              <ImageBroken size={16} />
                            </div>
                          {/if}
                        </div>
                      </td>
                      <td class="whitespace-nowrap px-6 py-4">
                        {#if isUserAttacker(log)}
                          You attacked <span class="font-medium text-white">{log.defender_username}</span>
                        {:else}
                          <span class="font-medium text-red-400">{log.attacker_username}</span> attacked you
                        {/if}
                      </td>
                      <td class="whitespace-nowrap px-6 py-4">
                        {log.type}
                      </td>
                      <td class="whitespace-nowrap px-6 py-4">
                        {#if log.type === 'inferno'}
                          <div class="flex justify-center items-center h-full w-full">-</div>
                        {:else}
                          {log.x} x {log.y}
                        {/if}
                      </td>
                      <td class="whitespace-nowrap px-6 py-4">
                        {getTimeAgo(log.attacktime)}
                      </td>
                      <td class="whitespace-nowrap px-6 py-4">
                        <button
                          class="px-3 py-1 text-white rounded text-xs"
                          on:click={() => { viewAttackLogs = true; }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="flex flex-col items-center justify-center py-12 text-center lg:px-20">
              <p class="font-display text-white text-center text-xl mb-2">No attack logs found</p>
              <p class="text-center text-white/60 max-w-md mx-auto">
                When you attack or are attacked, the logs will appear here.
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<AlertDialog
  bind:open={viewAttackLogs}
  title="Coming Soon"
  description="This feature is not yet available. Stay tuned for updates!"
  Icon={Notepad}
/>
