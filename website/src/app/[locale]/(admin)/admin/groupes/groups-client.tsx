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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
  const [regroupement, setRegroupement] = useState('1');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archiveBlockedOpen, setArchiveBlockedOpen] = useState(false);
  const [archiveBlockedMessage, setArchiveBlockedMessage] = useState<string | null>(null);

  const { data: groups = [], isLoading } = useGroups(regroupement);
  const { data: locations = [] } = useGroupLocations(selectedGroup?.Id_Groupe);
  const { data: users = [] } = useGroupUsers(selectedGroup?.Id_Groupe);

  useEffect(() => {
    if (!selectedGroup?.Id_Groupe) return;
    const groupId = selectedGroup.Id_Groupe;
    void queryClient.prefetchQuery({
      queryKey: ["groupLocations", groupId],
      queryFn: () => getJson(`/api/groupes/${groupId}/lieux`),
    });
    void queryClient.prefetchQuery({
      queryKey: ["groupUsers", groupId],
      queryFn: () => getJson(`/api/groupes/${groupId}/utilisateurs`),
    });
  }, [queryClient, selectedGroup?.Id_Groupe]);

  const handleNew = () => {
    setSelectedGroup(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedGroup) return;
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleArchive = async () => {
    if (!selectedGroup) return;

    try {
      await deleteJson(`/api/groupes/${selectedGroup.Id_Groupe}`);
      toast.success(t('toast.archive_success'));
      setSelectedGroup(null);
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.archive_error'));
    }
  };


  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="flex-1 p-4 md:p-6 space-y-6"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
      <Card>
        <CardHeader className="bg-linear-to-br from-card to-muted/20 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" />
              {t('title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('count', { count: groups.length })}
            </p>
          </div>
          <GroupsActions
            regroupement={regroupement}
            onRegroupementChange={setRegroupement}
            canEdit={!!selectedGroup}
            onNew={handleNew}
            onEdit={handleEdit}
            onArchive={() => setArchiveConfirmOpen(true)}
          />
        </CardHeader>
        <CardContent>
          <GroupsTable
            groups={groups}
            isLoading={isLoading}
            selectedGroupId={selectedGroup?.Id_Groupe ?? null}
            onSelectGroup={setSelectedGroup}
            onEditGroup={(group) => {
              setSelectedGroup(group);
              setIsEditing(true);
              setModalOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6 mb-12">
        <GroupLocationsPanel groupSelected={!!selectedGroup} locations={locations} />
        <GroupUsersPanel groupSelected={!!selectedGroup} users={users} />
      </div>

      <GroupModal open={modalOpen} onOpenChange={setModalOpen} group={selectedGroup} isEditing={isEditing} />
      </m.main>
    </LazyMotion>
  );
}

