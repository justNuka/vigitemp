using System;
using System.Collections.Generic;

namespace Vigitemp_Serveur
{
    internal interface IDatabaseProvider
    {
        int getIDLieuBySerialNumber(string p_sondSerialNumber);
        LieuAlarmSettings getLieuAlarmSettings(int idLieu);
        List<string> getPCsClients();
        bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance);
        (List<string>, List<string>, List<string>, List<string>) getInfosByIdServeurAndFrequencies(int p_idServer, int p_frequence);
        (string, string, string, string) getInfosByIdLieu(int p_idLieu);
        List<int> getDistinctIdServeur();
        List<int> getDistinctFrequenciesByIdServeur(int p_idServeur);
        (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze();
        double getLastMeasure(int p_IdLieu);
        bool setAlarmeByIdLieu(int p_idLieu, bool p_valeur);
        bool setLieuAlarmFlags(int idLieu, bool isPreAlarm, bool isAlarm);
        (double, double) getCoeffCalibrageBySerialNumber(string p_serial_number);
    }
}
