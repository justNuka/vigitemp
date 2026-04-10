using System;
using System.Collections.Generic;

namespace Vigitemp_Serveur
{
    internal interface IDatabaseProvider : IDisposable
    {
        int getIDLieuBySerialNumber(string p_sondSerialNumber);
        LieuAlarmSettings getLieuAlarmSettings(int idLieu);
        List<string> getPCsClients();
        bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance);
        bool AddHistoricalMesureIfMissing(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance, DateTime measureDateTime);
        bool AddMesureNoResponse(string p_numeroSerie, string p_unite);
        bool UpdateLieuWirelessMetrics(string p_numeroSerie, int? batteryPercent, int? rssi);
        List<SondeScheduleInfo> getSondesActivesByServeur(int idServeur);
        (string portSerie, string sondeNumeroSerie, string sondeType, string familleSonde, string sondeAdresse, string moduleNumeroSerie) getInfosByIdLieu(int p_idLieu);
        List<int> getDistinctIdServeur();
        (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze();
        (List<int>, List<DateTime>) getLieuxAvecSurveillanceEnSnooze();
        (double value, string unit, bool hasValue) getLastMeasureWithUnit(int idLieu);
        bool setAlarmeByIdLieu(int p_idLieu, bool p_valeur);
        bool setSurveillanceByIdLieu(int p_idLieu, bool p_valeur);
        bool setThresholdAlarm(int idLieu, string sondeNumeroSerie, string type, double value, string unite, bool isActive);
        bool setLieuAlarmFlags(int idLieu, bool isPreAlarm, bool isAlarm);
        bool getLieuImmediateRetriggerFlag(int idLieu);
        bool setLieuImmediateRetriggerFlag(int idLieu, bool enabled);
        bool setLieuInfosModifiees(int idLieu, bool value);
        bool setNonResponseAlarm(int idLieu, string sondeNumeroSerie, bool isActive);
        bool setPowerAlarm(int idLieu, string sondeNumeroSerie, bool isActive);
        string getParameterValue(string section, string motCle);
        AlarmSummary getActiveAlarmSummary(int idLieu);
        bool hasActiveAcknowledgedAlarm(int idLieu, string type);
        int getLastAlarmIdByServeur(int idServeur);
        List<AlarmNotificationItem> getNewAlarmsSince(int idServeur, int lastAlarmId, int maxCount);
        List<AlarmNotificationItem> getEndedAlarmsSince(int idServeur, DateTime sinceLocalTime, int maxCount);
        string getLieuUnite(int idLieu);
        SondeMetrologySettings getSondeMetrologyBySerialNumber(string p_serial_number);
        bool writeAuditJournal(string codeJournal, string username, string userProfile, int? idLieu, string commentaire, string commentaireUtilisateur);
        List<(int idLieu, bool isAlarm, bool isNonResponse)> getActiveLieuAlarmStates();
    }
}

