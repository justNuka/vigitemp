'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";

import { useGroups, type Group } from '@/hooks/useGroups';
import { useGroupLocations } from '@/hooks/useGroupLocations';
import { useGroupUsers } from '@/hooks/useGroupUsers';
import { deleteJson, getJson, HttpError } from "@/lib/http";

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GroupsActions } from "./_components/groups-actions";
import { GroupsTable } from './_components/groups-table';
import { GroupLocationsPanel } from './_components/group-locations-panel';
import { GroupUsersPanel } from './_components/group-users-panel';
import { GroupModal } from './group-modal';

export function GroupsClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('groupsPage');
  const tCommon = useTranslations('common');
  const [regroupement, setRegroupement] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archiveBlockedOpen, setArchiveBlockedOpen] = useState(false);
  const [archiveBlockedMessage, setArchiveBlockedMessage] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<'active' | 'archived'>('active');

  const { data: groups = [], isLoading } = useGroups(regroupement, true, 'all');
  const activeGroups = groups.filter((group) => !group.Est_Archive);
  const archivedGroups = groups.filter((group) => Boolean(group.Est_Archive));
  const displayedGroups = statusTab === 'active' ? activeGroups : archivedGroups;
  const selectedDisplayedGroup = selectedGroup ? displayedGroups.find((group) => group.Id_Groupe === selectedGroup.Id_Groupe) ?? null : null;
  const { data: locations = [] } = useGroupLocations(selectedDisplayedGroup?.Id_Groupe);
  const { data: users = [] } = useGroupUsers(selectedDisplayedGroup?.Id_Groupe);

  useEffect(() => {
    if (!selectedDisplayedGroup?.Id_Groupe) return;
    const groupId = selectedDisplayedGroup.Id_Groupe;
    void queryClient.prefetchQuery({
      queryKey: ["groupLocations", groupId],
      queryFn: () => getJson(`/api/groupes/${groupId}/lieux`),
    });
    void queryClient.prefetchQuery({
      queryKey: ["groupUsers", groupId],
      queryFn: () => getJson(`/api/groupes/${groupId}/utilisateurs`),
    });
  }, [queryClient, selectedDisplayedGroup?.Id_Groupe]);

  const handleNew = () => {
    setSelectedGroup(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedDisplayedGroup) return;
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleArchive = async () => {
    if (!selectedDisplayedGroup) return;

    try {
      await deleteJson(`/api/groupes/${selectedDisplayedGroup.Id_Groupe}`);
      toast.success(t('toast.archive_success'));
      setSelectedGroup(null);
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.refresh();
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        const payload = error.payload as { linkedLocationsCount?: unknown; count?: unknown } | null;
        const count =
          typeof payload?.linkedLocationsCount === 'number'
            ? payload.linkedLocationsCount
            : typeof payload?.count === 'number'
              ? payload.count
              : null;
        setArchiveBlockedMessage(
          count && count > 0
            ? `${error.message} (${count})`
            : error.message,
        );
        setArchiveConfirmOpen(false);
        setArchiveBlockedOpen(true);
        return;
      }
      toast.error(error instanceof Error ? error.message : t('toast.archive_error'));
    }
  };


  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="flex-1 space-y-4"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
      <section className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]">
        <GroupsTable
          groups={displayedGroups}
          isLoading={isLoading}
          selectedGroupId={selectedDisplayedGroup?.Id_Groupe ?? null}
          onSelectGroup={(group) =>
            setSelectedGroup((current) => current?.Id_Groupe === group.Id_Groupe ? null : group)
          }
          onEditGroup={(group) => {
            if (statusTab === 'archived') return;
            setSelectedGroup(group);
            setIsEditing(true);
            setModalOpen(true);
          }}
          toolbarLeft={
            <Tabs
              value={statusTab}
              onValueChange={(value) => {
                setStatusTab(value as 'active' | 'archived');
                setSelectedGroup(null);
              }}
            >
              <TabsList className="grid h-8 w-auto grid-cols-2 gap-0.5 rounded-md border border-border bg-[hsl(var(--surface-muted))] p-0.5 text-muted-foreground">
                <TabsTrigger value="active" className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border">
                  {t('tabs.active', { count: activeGroups.length })}
                </TabsTrigger>
                <TabsTrigger value="archived" className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border">
                  {t('tabs.archived', { count: archivedGroups.length })}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
          toolbarRight={
            <GroupsActions
              regroupement={regroupement}
              onRegroupementChange={(value) => {
                setRegroupement(value);
                setSelectedGroup(null);
              }}
              canEdit={!!selectedDisplayedGroup && statusTab === 'active'}
              canArchive={!!selectedDisplayedGroup && statusTab === 'active'}
              onNew={handleNew}
              onEdit={handleEdit}
              onArchive={() => setArchiveConfirmOpen(true)}
            />
          }
        />
      </section>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <GroupLocationsPanel groupSelected={!!selectedDisplayedGroup} locations={locations} />
        <GroupUsersPanel groupSelected={!!selectedDisplayedGroup} users={users} />
      </div>

      {modalOpen ? (
        <GroupModal
          key={isEditing ? `edit-${selectedGroup?.Id_Groupe ?? "unknown"}` : "create-group"}
          open={modalOpen}
          onOpenChange={setModalOpen}
          group={selectedGroup}
          isEditing={isEditing}
        />
      ) : null}

      <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.archive')}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedDisplayedGroup?.Nom_Groupe ?? "-"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleArchive().finally(() => setArchiveConfirmOpen(false));
              }}
              className="bg-[hsl(var(--status-critical))] text-white hover:bg-[hsl(var(--status-critical)/0.90)]"
            >
              {t('actions.archive')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveBlockedOpen} onOpenChange={setArchiveBlockedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.archive')}</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveBlockedMessage || t('toast.archive_error')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setArchiveBlockedOpen(false)}>
              {tCommon('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </m.main>
    </LazyMotion>
  );
}

