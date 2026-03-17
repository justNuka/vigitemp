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
        bool AddMesureNoResponse(string p_numeroSerie, string p_unite);
        (List<string>, List<string>, List<string>, List<string>, List<int>, List<DateTime?>) getInfosByIdServeurAndFrequencies(int p_idServer, int p_frequence);
        List<SondeScheduleInfo> getSondesActivesByServeur(int idServeur);
        (string, string, string, string) getInfosByIdLieu(int p_idLieu);
        List<int> getDistinctIdServeur();
        List<int> getDistinctFrequenciesByIdServeur(int p_idServeur);
        (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze();
        (List<int>, List<DateTime>) getLieuxAvecSurveillanceEnSnooze();
        double getLastMeasure(int p_IdLieu);
        (double value, string unit, bool hasValue) getLastMeasureWithUnit(int idLieu);
        bool setAlarmeByIdLieu(int p_idLieu, bool p_valeur);
        bool setSurveillanceByIdLieu(int p_idLieu, bool p_valeur);
        bool setThresholdAlarmEnded(int idLieu);
        bool setThresholdAlarm(int idLieu, string sondeNumeroSerie, string type, double value, string unite, bool isActive);
        bool setLieuAlarmFlags(int idLieu, bool isPreAlarm, bool isAlarm);
        bool getLieuImmediateRetriggerFlag(int idLieu);
        bool setLieuImmediateRetriggerFlag(int idLieu, bool enabled);
        bool setLieuInfosModifiees(int idLieu, bool value);
        bool setNonResponseAlarm(int idLieu, string sondeNumeroSerie, bool isActive);
        AlarmSummary getActiveAlarmSummary(int idLieu);
        bool hasActiveAcknowledgedAlarm(int idLieu, string type);
        int getLastAlarmIdByServeur(int idServeur);
        List<AlarmNotificationItem> getNewAlarmsSince(int idServeur, int lastAlarmId, int maxCount);
        List<AlarmNotificationItem> getEndedAlarmsSince(int idServeur, DateTime sinceLocalTime, int maxCount);
        string getLieuUnite(int idLieu);
        (double, double) getCoeffCalibrageBySerialNumber(string p_serial_number);
        SondeMetrologySettings getSondeMetrologyBySerialNumber(string p_serial_number);
        bool writeAuditJournal(string codeJournal, string username, string userProfile, int? idLieu, string commentaire, string commentaireUtilisateur);
    }
}

