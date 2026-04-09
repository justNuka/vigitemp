"use client"




import { Power, PowerOff } from "lucide-react"


import { useLocale, useTranslations } from "next-intl"




import { MonitoringCardSkeleton } from "@/components/monitoring-card-skeleton"


import { useAppTimezone } from "@/components/timezone-provider"


import { SurveillanceEmptyState } from "./_components/monitoring-empty-state"




import { MonitoringSiteSection } from "./_components/monitoring-site-section"


import { groupSensorsBySiteAndGroup } from "./_helpers/group-sensors"


import { usePersistentStringSet } from "./_hooks/use-persistent-string-set"


import type { SensorWithLocation } from "@/lib/api"
import type { SurveillanceSortMode } from "./_helpers/monitoring-derived"




interface MonitoringCardsGridProps {


  sensors: SensorWithLocation[]


  disabledFirst?: boolean


  isLoading?: boolean


  onSurveillanceToggle?: (


    idLieu: number,


    action: "surveillance" | "alarms",


    newState: boolean,


    durationMinutes?: number | null,


  ) => void




  onEditLocation?: (idLieu: number) => void


  showNullNonResponse?: boolean
  sortMode?: SurveillanceSortMode


}




function MonitoringCardsGridSkeleton({ title }: { title: string }) {


  return (


    <div className="space-y-2">


      <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />


      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">


        {Array.from({ length: 4 }).map((_, i) => (


          <MonitoringCardSkeleton key={`${title}-${i}`} />


        ))}


      </div>


    </div>


  )


}




function MonitoringSectionHeader({


  title,


  icon,


}: {


  title: string


  icon: React.ReactNode


}) {


  return (


    <div className="space-y-2">


      <div className="flex items-center gap-2 text-xl font-semibold text-slate-700 dark:text-slate-50">


        {icon}


        {title}


      </div>


      <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />


    </div>


  )


}




export function MonitoringCardsGrid({


  sensors,


  disabledFirst = false,


  isLoading = false,


  onSurveillanceToggle,




  onEditLocation,


  showNullNonResponse = false,
  sortMode = "status",


}: MonitoringCardsGridProps) {


  const t = useTranslations("surveillance")


  const locale = useLocale()


  const timezone = useAppTimezone()


  const { value: expandedSites, toggle: toggleSite } = usePersistentStringSet("surveillance-expanded-sites")


  const { value: expandedGroups, toggle: toggleGroup } = usePersistentStringSet("surveillance-expanded-groups")




  const handleSurveillanceToggle =


    onSurveillanceToggle ??


    ((_: number, __: "surveillance" | "alarms", ___: boolean, ____?: number | null) => {


      // no-op


    })




  if (isLoading && sensors.length === 0) {


    return (


      <div className="p-4 md:p-6 space-y-8">


        <div className="space-y-6">


          <MonitoringSectionHeader title={t("grid.active_title")} icon={<Power className="h-5 w-5 text-sky-500" />} />


          <MonitoringCardsGridSkeleton title="active" />


        </div>


        <div className="space-y-4">


          <MonitoringSectionHeader title={t("grid.disabled_title")} icon={<PowerOff className="h-5 w-5 text-slate-400" />} />


          <MonitoringCardsGridSkeleton title="disabled" />


        </div>


      </div>


    )


  }




  if (sensors.length === 0) {


    return <SurveillanceEmptyState title={t("grid.empty_title")} />


  }




  const disabledSensors = sensors.filter((sensor) => sensor.location.surveillanceDisabled)


  const activeSensors = sensors.filter((sensor) => !sensor.location.surveillanceDisabled)

  const groupingLabels = {
    noGroup: t("grid.no_group"),
    noSite: t("grid.no_site"),
  }

  const groupedActive = groupSensorsBySiteAndGroup(activeSensors, groupingLabels, sortMode)

  const groupedDisabled = groupSensorsBySiteAndGroup(disabledSensors, groupingLabels, sortMode)

  const countLocations = (items: SensorWithLocation[]) => new Set(items.map((sensor) => Number(sensor.location.id ?? sensor.id)).filter((id) => Number.isFinite(id))).size




  const sections = [


    {


      key: "active",


      title: `${t("grid.active_title")} (${countLocations(activeSensors)})`,


      icon: <Power className="h-5 w-5 text-sky-500" />,


      sites: groupedActive,


      disabledView: false,


      emptyMessage: null,


      className: "space-y-6",


    },


    {


      key: "disabled",


      title: `${t("grid.disabled_title")} (${countLocations(disabledSensors)})`,


      icon: <PowerOff className="h-5 w-5 text-slate-400" />,


      sites: groupedDisabled,


      disabledView: true,


      emptyMessage: t("grid.disabled_empty"),


      className: "space-y-4",


    },


  ] as const




  return (


    <div className="p-4 md:p-6 flex flex-col gap-8 animate-fade-in">


      {sections.map((section, index) => {
        const order = index === 0
          ? (disabledFirst ? 2 : 1)
          : (disabledFirst ? 1 : 2)

        return (
          <div key={section.key} className={section.className} style={{ order }}>


            <MonitoringSectionHeader title={section.title} icon={section.icon} />


            {section.sites.length > 0 ? (


              <div className="space-y-6">


                {section.sites.map((site) => (


                  <MonitoringSiteSection


                    key={`${section.key}-${site.siteId}`}


                    site={site}


                    siteKey={section.disabledView ? `disabled-${site.siteId}` : site.siteId}


                    disabledView={section.disabledView}


                    expandedSites={expandedSites}


                    expandedGroups={expandedGroups}


                    toggleSite={toggleSite}


                    toggleGroup={toggleGroup}


                    locale={locale}


                    timezone={timezone}


                    t={t}




                    onSurveillanceToggle={handleSurveillanceToggle}


                    onEditLocation={onEditLocation}


                    showNullNonResponse={showNullNonResponse}
                    sortMode={sortMode}


                  />


                ))}


              </div>


            ) : section.emptyMessage ? (


              <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-500">


                {section.emptyMessage}


              </div>


            ) : null}


          </div>
        )
      })}




    </div>


  )


}


