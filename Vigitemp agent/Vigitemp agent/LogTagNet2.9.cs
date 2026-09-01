/*
| ==============================================================================
| Copyright (C) 2017 LogTag Recorders Limited.  All Rights Reserved.
|
| Redistribution of this header file, in original or modified form, without
| prior written consent of LogTag is prohibited.
|
|==============================================================================
|
| This file defines the .NET interface to LogTag API
|
|==============================================================================
|
| THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
| WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE,
| NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A PARTICULAR  PURPOSE ARE
| DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
| INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
| LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
| OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED  AND ON ANY THEORY OF
| LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
| NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
| EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
|
|==============================================================================
| Change history
| MP 01.10.2008 Initial Version
| FP 10.10.2009 Changed marshalling of LOGTAG_READING members, made LOGTAG_SENSOR members public
| FP 31.01.2010 Added GetInfo2() and SetInfo2() function, enabling LOGTAG_SENSOR structure to be passed separately
| FP 29.06.2010 Added GetDaySummary() and new TRID-specific defines, added new members to LOGTAG_INFO structure
| FP 11.11.2011 Added functions for SDK version 2.1
| FP 06.04.3013 Changed to SDK 2.3
| FP 21.05.2014 Changed to SDK 2.4
| FP 27.01.2015 Changed to SDK 2.5
| FP 20.04.2016 Changed to SDK 2.6
| FP 08.06.2016 Changed to SDK 2.7
| FP 24.04.2017 Changed to SDK 2.8
| FP 30.11.2017 Changed to SDK 2.9 
 */




using System;
using System.Text;
using System.Runtime.InteropServices;

namespace LogTagNET
{
    /// <summary>
    /// .NET interface to LogTag API
    /// </summary>
    using HANDLE = UInt32;
    using LOGTAG_HANDLE = UInt32;
    using HINSTANCE = IntPtr;

    public enum FEEDBACK_EVENT : uint
    {
        USEREXIT = 0x0000,
        RETRY = 0x0001,
        UPLOAD = 0x0002,
        DOWNLOAD = 0x0004
    }

    public enum FEEDBACK_FLAG : uint
    {
        OK = 0x0000,
        EXIT = 0x0001
    }

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_FEEDBACK
    {
        UInt32 cbSize;
        UInt32 nFlags;
        UInt32 dwEvent;
        long lParam;
        UInt32 dwProgress;
        UInt32 dwRemaining;
        UInt64 ullHookParam;
    };

    public enum COMMPORT : uint
    {
        UNDEFINED = 0x0000,
        SERIAL = 0x0001,
        MULTIIO = 0x0002,
        IRDA = 0x0003,
        USB = 0x0004,
        HID = 0x0005,
        LTHID = 0x0008
    };

    [StructLayout(LayoutKind.Sequential, Pack = 8, CharSet = CharSet.Ansi)]
    public struct LOGTAG_PORTINFO
    {
        public UInt32 cbSize;
        public UInt16 wPortType;
        public UInt16 wPortIndex;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 128 * 2)]
        public byte[] szInitCommand;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64 * 2)]
        public byte[] szSerialNum;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64 * 2)]
        public byte[] szDescription;
        public UInt16 wPID;
    };

    // LogTag interface types
    public enum LTIID : uint
    {
        UNDEFINED = 0x0000,
        SERIALRS232 = 0x0001,
        USB = 0x0002,
        HID = 0x0003
    };

    public enum LTIS : uint
    {
        LOGTAG = 0x0001,
        CHANGED = 0x0002
    };

    [StructLayout(LayoutKind.Sequential, Pack = 8, CharSet = CharSet.Ansi)]
    public struct LOGTAG_INTERFACE
    {
        public UInt32 cbSize;
        public UInt16 wDeviceID;
        public UInt16 wStatus;
        public UInt16 wVolts;
        public UInt16 reserved;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32 * 2)]
        public byte[] szManufactured;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32 * 2)]
        public byte[] szProductId;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 16 * 2)]
        public byte[] szSerialNum;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 16 * 2)]
        public byte[] szVersion;
    }

    // LogTag sensor types
    public enum LTSID : uint
    {
        UNDEFINED = 0x0000,
        TEMPERATURE = 0x0001,
        HUMIDITY = 0x0002
    }

    // LogTag sensor scale types
    public enum LTSS : uint
    {
        USERDEFINED = 0x0000,
        CELSIUS = 0x0001,
        FAHRENHEIT = 0x0002,
        KELVIN = 0x0004,
        HUMIDITY = 0x0008
    }

    // LogTag sensor flag masks
    public enum LTSF : uint
    {
        ACTIVE = 0x0001,
        ALERT_CLEAR = 0x0002,
        ALERT_LATCHED = 0x0004,
        ALERT_TRIGGER = 0x0008,
        CAN_DISABLE = 0x0010,
        CAN_ALERT = 0x0020,
        CAN_CLEAR_ALERT = 0x0040,
        SHOW_ACTIVE = 0x0100,
        SHOW_ALERT = 0x0200,
        HI_ALERT_TRIGGER = 0x0400,
        LO_ALERT_TRIGGER = 0x0800,
        CALIBRATION_DAMAGED = 0x8000,
        TNCON_ALERT_LOWER = 0x1000,
        TNCON_ALERT_UPPER = 0x2000,
        TCON_ALERT_LOWER = 0x4000,
        TCON_ALERT_UPPER = 0x0080
    };

    public enum LTSF_TRID : uint
    {    // LogTag sensor flags, alert settings for TRID (AxCONTROL byte). 
        ENABLE_ALERT = 0x80,
        ENABLE_DELAY = 0x40,
        DELAY_TYPE_CONSEC = 0x20,
        ACCDELAYTRIGGER = 0x10,
        LTSF_INSTANT_ALERT = 0x08,
        ENABLE_BEEPER = 0x08,
        ENABLE_CLEAR = 0x04,
        LATCH = 0x02,
        ALERT_DIRECTION_UPPER = 0x01
    };

    public enum LTR : uint
    {
        SUCCESS = 0x0000,                       // Success
        FAILURE = 0x20000001,                   // Failure with unknown cause, used very rarely
        ACCESS_COMMS = 0x20000002,              // Attempt to use comms failed (in use by something else?)
        ACCESS_FILE = 0x20000003,               // Attempt to access file failed (in use by something else?)
        COMMS_ERROR = 0x20000004,               // Communication failed, context has error information, which will be one of the LTR_COMMS_ below
        DEVICE_NOT_FOUND = 0x20000005,          // Unable to locate a known device
        DYNAMIC_MEMORY = 0x20000006,            // Attempt to allocate dynamic memory failed
        HANDLE = 0x20000007,                    // Error exists with the LOGTAG_HANDLE
        HARDWARE = 0x20000008,                  // The hardware on this system does not meet requirements for software
        PASSWORDREQUIRED = 0x20000009,          // Attempt to access information without supplying correct password
        UNSUPPORTED_DATAMAP = 0x2000000A,       // Attempt to access device, which has a version of non firmware specific data region not supported by this version of software
        UNSUPPORTED_DEVICE = 0x2000000B,        // Attempt to access hardware not supported by this version of software
        UNSUPPORTED_FILE = 0x2000000C,          // Attempt to access file, that has format not supported by this version of software
        UNSUPPORTED_FIRMWARE = 0x2000000D,      // Attempt to access hardware, which has firmware not supported by this version of software
        UNSUPPORTED_PROTOCOL = 0x2000000E,      // Attempt to use a communication protocol, which is not supported by this version of software
        DEVICE_CONFIGURATION = 0x2000000F,      // Attempt to use a device which has a configuration that is incorrectly setup or a setup that is not supported
        USER_EXIT = 0x20000010,                 // User requested process to exit prior to completion
        HANDLE_LOCKED = 0x20000011,             // Failure due to operation on handle already pending
        USE_EXPIRED = 0x20000012,               // unable to continue using device, lease expired
        UNSUPPORTED_COMMS = 0x20000013,         // Attempt to access comms hardware not supported by this version of software
        CONNECT_SERVER = 0x20000014,            // unable to connect to (TCP) LogTag User server
        USER_ACCOUNT_LOCKED = 0x20000015,       // Cannot logon as user account is locked
        GUID = 0x20000016,                      // operation supplied incorrect guid
        ADD_SERVER_REQUEST = 0x20000017,        // server has requested additional subsequent information to be completed
        CONTENT = 0x20000018,                   // The content within the memory of LT product unable to be correctly & successfully decoded, report error to developers to correct
        CALIBRATION = 0x20000019,               // The sensor calibration information does not contain correct information
        HARDWARE_CHANGED = 0x2000001A,          // The hardware has changed and therefore the process can not complete successfully
        CALIBRATION_PARAMETER = 0x2000001B,     // The sensor calibration parameters cause an incomplete calibration
        CANNOT_HIBERNATE = 0x2000001C,          // This logger cannot be hibernated
        DIFF_LOGGER_TYPES = 0x2000001D,         // Loggers of different types cannot be configured at the same time
        MISSING_SENSOR_INFO = 0x2000001E,		// The LOGTAG_INFO structure passed must contain a valid LOGTAG_SENSOR structure for each sensor
        CALIBRATION_VERSION = 0x2000001F,		// The sensor calibration version is not supported
        CREATE_FOLDER = 0x20000020,		        // Unable to create folder
        ERROR_QUICK_RECONFIGURE = 0x20000021,   // This logger cannot be configured with quick-reconfigure, need to use regular configuration dialog
        START_METHOD_CONFIG_ERROR = 0x20000022, // cannot re-configure with date/time start (internal error message only)
        BATTERY_LOW_NO_UPLOAD = 0x20000023,     // cannot configure due to low battery (internal error message only)
        UNSUPPORTED_FILE_NEWER = 0x20000024,    // Attempt to access file created with newer version of software
        LOGGER_LOCKED = 0x20000025,             // This logger cannot be reconfigured/recalibrated
        UNSUPPORTED_CODE_PAGE = 0x20000026,     // Code Page for a password unsupported
        READBACK_CHECK_FAILED = 0x20000027,     // configuration readback check failed
        LOGGER_CHANGED = 0x20000028,		    // Logger has been changed during configuration
        NEED_UPDATE_CONFIGURABLE = 0x20000029,	// Logger needs to be upgraded to enable configuration 
        CANNOT_DOWNLOAD = 0x20000030,		    // No download possible due to low battery
        SUPPORTED_WITH_UPDATE = 0x20000031,	    // Product can only be used after firmware update
        MISSING_PDF_INFO = 0x20000032,		    // The LOGTAG_INFO structure passed must contain a valid pointer to a LOGTAG_PDF_INFO structure
        UNSUPPORTED_INTERFACE_TYPE = 0x20000033	// The interface type is not supported 
    };

    public enum LTR_COMMS : uint
    {
        NOERROR = 0x00000,	        // No Error – internal
        INTERNALERROR = 0x00001,	// Internal General Error (unimplemented or otherwise)
        BADMSGSIZE = 0x00002,	    // Bad Message Size
        BADFCHKSUM = 0x00003,	    // Message FCHKSUM error
        BADCOMCHAR = 0x00004,	    // Unknown Comchar
        BADBAUDCODE = 0x00010,	    // Baud code passed is unknown 
        NOLTA1 = 0x00020,	        // Failed to get LTA from Logtag (initial) 
        NOLTA2 = 0x00021,	        // Failed to get LTA acknowledge-back from Logtag
        LTNOREPLY = 0x00023,	    // Logtag did not reply (LTA successful)
        SYNCREADNOACK = 0x00030,	// Failed Acknowledge from I2C target device
        HID_REPORT_ID = 0x00040,	// Incorrect HID Report ID
        SYSCMD_ERROR = 0x00050,	    // System command has timed out or failed

        TIC_BADMSG = 0x00099,	    // TIC interface: Failed message detected
        UNKNOWN = 0x00000,
        MODEM = 0x00001,

        PROCESS = 0x10000,
        NOREPLY = 0x10001,
        MSGINVALID = 0x10002,
        VERIFYFAIL = 0x10003,
        HARDWARE = 0x20000
    };

    public enum LTCOMMS : uint
    {
        UNKNOWNCOMCHAR = 1,
        CHKSUM = 2,
        CONTENT = 3,
        FAILEDI2C = 4
    }

    public enum LTR_FAILURE : uint
    {
        NOINTERFACE = 0x28000001,
        NOLOGTAG = 0x28000002,
        NOPOWER = 0x28000003
    };

    // Specific Device Configuration failures
    public enum LTR_CONFIG : uint
    {
        DATAMAP_CS = 0x0001,
        SENSOR_TCS = 0x0002,
        SENSOR_TCAL = 0x0003,
        SENSOR_HCS = 0x0004,
        SENSOR_HCAL = 0x0005,
        CONFIG_SENSOR_TLCS = 0x0006 // failed lookup table checksum
    };

    [StructLayout(LayoutKind.Sequential, Pack = 8, CharSet = CharSet.Ansi)]
    public struct LOGTAG_USER
    {
        UInt32 cbSize;
        UInt32 nFlags;
        UInt32 dwUserId;
        UInt16 nMinPassUInt16Chars;
        UInt16 nMinPassUInt16Digits;
        UInt32 nSessionTimeout;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64 * 2)]
        string szUsername;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        string szFullname;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        string szDescription;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        string szEmail;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32 * 2)]
        string szPassUInt16;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        string szIssuer;
        UInt32 nSignatureCharCount;
        [MarshalAs(UnmanagedType.LPWStr)]
        string pszSignatures;
        UInt32 nAuthority;
    };

    [StructLayout(LayoutKind.Sequential, Pack = 8, CharSet = CharSet.Ansi)]
    public struct SYSTEMTIME
    {
        public short wYear;
        public short wMonth;
        public short wDayOfWeek;
        public short wDay;
        public short wHour;
        public short wMinute;
        public short wSecond;
        public short wMilliseconds;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)] // 2 not 8 since 282
    public struct LOGTAG_SENSOR
    {
        public UInt32 cbSize;
        public UInt16 wDeviceID;
        public UInt16 wIdentifier;
        public short iNumOfDP;
        public UInt16 wConsecutiveAlertDelay;
        public UInt16 wNonConsecutiveAlertDelay;
        public UInt16 wMaxConsecutiveAlertDelay;
        public UInt16 wMaxNonConsecutiveAlertDelay;
        public double dUpperLimit;
        public double dLowerLimit;
        public double dUpperAlert;
        public double dLowerAlert;
        public UInt16 nFlags;
        public UInt16 wScale;
        public UInt16 wMaxUserInfo;
        public UInt16 wMaxScale;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64 * 2)]
        public byte[] szUserInfo;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32 * 2)]
        public byte[] szScale;
        SYSTEMTIME stCalibrated;
        public double dUpperRated;
        public double dLowerRated;
    };

    // LogTag reading attributes
    public enum LTRA : uint
    {
        ABOVELIMIT = 0x0001,	// reading was equal to or greater than maximum device capable of measuring
        BELOWLIMIT = 0x0002,	// reading was equal to or less than minimum device capable of measuring
        ABOVEALERT = 0x0004,	// reading was equal to or greater than upper alert 
        BELOWALERT = 0x0008,	// reading was equal to or less than upper alert 
        INVALID = 0x0100,	    // reading was invalid, usually due to a settling or calibration period required by sensor
        NOTVALIDATED = 0x0200,	// reading retrieved from memory of device was not compliant with integrity checks
        RECALIBRATED_HUM = 0x0400,	// readings were taken before the last sensor re-calibration (humidity)
        RECALIBRATED_TEMP = 0x0800,	// readings were taken before the last sensor re-calibration (humidity)
        EVENT_DOWNLOAD = 0x1000,    // readings were downloaded just prior to or at same time this reading was recorded
        EVENT_MARKED = 0x2000,      // readings were marked as inspected just prior to or at same time this reading was recorded
        EVENT_PAUSED = 0x4000,	    // reading marked as taken during paused state (not to be included in statistics)
        EVENT_TIME_CHANGED = 0x8000,    // reading marked as taken after the display clock has been changed (TRID)
        EVENT_LOW_ALARM_TRIGGERED = 0x10000,	// reading marked as low alarm trigger (iS0Tag)
        EVENT_HIGH_ALARM_TRIGGERED = 0x20000,	// reading marked as high alarm trigger (iS0Tag)
        EVENT_PAUSED_CONNECTED = 0x40000,	    // reading marked as taken while plugged in (USB loggers, not to be included in statistics)
        EVENT_SENSOR_DISCONNECTED = 0x80000     // reading marked as taken while the external temperature sensor was disconnected
    }

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public unsafe struct LOGTAG_READING
    {
        [MarshalAsAttribute(UnmanagedType.ByValArray, SizeConst = 3)]
        public UInt32[] dwAttributes;
        //UInt32 dwAttributes0;
        //UInt32 dwAttributes1;
        //UInt32 dwAttributes2;
        public SYSTEMTIME stTaken;
        [MarshalAsAttribute(UnmanagedType.ByValArray, SizeConst = 3)]
        public double[] dReading;
        //double dReading0;
        //double dReading1;
        //double dReading2;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 128 * 2)]
        public byte[] szComment;
    }

    // PDF logger options
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public unsafe struct LOGTAG_PDF_INFO
    {
        public UInt32 cbSize;
        public UInt16 iTimeZone;			// configuration time zone, signed, number of 15-minute intervals between configuration time and UTC
        public UInt16 wPDFOptions;
        public byte bPDFChartYAxisScaling;	// 0: auto scale (readings range + 0.5), 1: CUSTOM_Y, as per dPDFChartYAxisMax and dPDFChartYAxisMin, 2: sensor range
        public UInt16 wPDFChartOptions;		// B0: lower alarm line, B1: upper alarm line, B4: x-axis grids, B5: y-axis grids, B7: elapsed time
        public double dPDFChartYAxisMax;	// max. value to display on y-axis if CUSTOM_Y is selected in Scaling options
        public double dPDFChartYAxisMin;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 17 * 2)]
        public byte[] szPDFPassword;		// future use
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 17 * 2)]
        public byte[] szPDFBrandname;		// Brand name in ASCII, to support FAT
        public UInt32 dwMKTDeltaH;			// Delta H value for MKT calculation, stored as value * 1000 (unsigned)
        public byte bPDFLogoId;				// 0: undefined, 1: LogTag
        public byte bPDFLogoFileType;		// 0: undefined, 1: SVG
        public UInt32 dwPDFLogoAddr;		// logo address i SFLASH, address / 256
        public UInt16 wPDFLogoSize;			// logo size in bytes / 256 (number of 256 byte pages)
        public UInt16 wPDFLogoWidth;		// logo width in pixels
        public UInt16 wPDFLogoHeight;		// logo height in pixels
        public byte bFileControl;			// Bit 0: Generate PDF, bit 1: Generate ltd, bit 2: Generate csv
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 6)] // changed to size 6 in SDK 2.8
        public long[] dwAlertPVal80;		// Alert threshold value in deg C * 80, as stored in logger
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 2)]
        public long[] dwLimitsPVal80;		// Sensor limits (lower, upper) in deg C * 80, as stored in logger
        public UInt32 dwFirmwareVersion;    // Read-only Product firmware version, Format: 00xx yyzz with xx: Major, yy: Minor, zz: Revision (LSB)
        public UInt32 dwHardwareID;			// Hardware Id, production related information to identify component
        public UInt32 dwPID;				// product ID
        public long lConfigTimeZone;		// configuration time zone, signed, in minutes from UTC
        public UInt32 dwPDFExtraFlags;		// reserved for future use
    }

    // LogTag device (wDeviceID) types
    public enum LTDID : uint
    {
        UNDEFINED = 0x0000,
        TRIX = 0x0001,
        HAXO = 0x0002,
        TREX = 0x0003,
        SRIC = 0x0004,
        TRIL = 0x0005,
        TREL = 0x0006,
        TRID = 0x0007,
        TRED = 0x0008,
        TIC20 = 0x0009,
        TICT = 0x000A,
        ISOTAG = 0x000C, // both spellings supported (0 and O)
        IS0TAG = 0x000C,
        USRIC = 0x000D,
        USRIC8 = 0x000D,
        UTRIX = 0x000E,
        USRIC4 = 0x000F,
        UTRID =	0x0010,
        UTRIX16M = 0x0011,
        USRIC8M	= 0x0012,
        LASTKNOWN = USRIC8M
    }

    // LogTag temperature limits
    public enum LTTL : int
    {
        LOWER_TEMP_LIMIT_TRIX = -40,
        LOWER_TEMP_LIMIT_HAXO = -40,
        LOWER_TEMP_LIMIT_TREX = -40,
        LOWER_TEMP_LIMIT_SRIC = -25,
        LOWER_TEMP_LIMIT_TRID = -30,
        LOWER_TEMP_LIMIT_TRIL = -85,
        LOWER_TEMP_LIMIT_TREL = -85,
        LOWER_TEMP_LIMIT_USRIC = -25,
        LOWER_TEMP_LIMIT_UTRIX = -25,
        LOWER_TEMP_LIMIT_UTRID = -25,
        LOWER_TEMP_LIMIT_TIC20 = -30,
        LOWER_TEMP_LIMIT_TIC45 = -25,
        LOWER_TEMP_LIMIT_TICT = -25,
        LOWER_TEMP_LIMIT_ISOTAG = -25,
        UPPER_TEMP_LIMIT_TRIX = 85,
        UPPER_TEMP_LIMIT_HAXO = 85,
        UPPER_TEMP_LIMIT_TREX = 99,
        UPPER_TEMP_LIMIT_SRIC = 60,
        UPPER_TEMP_LIMIT_TRID = 60,
        UPPER_TEMP_LIMIT_USRIC = 60,
        UPPER_TEMP_LIMIT_UTRIX = 70,
        UPPER_TEMP_LIMIT_UTRID = 65,
        UPPER_TEMP_LIMIT_TRIL = 40,
        UPPER_TEMP_LIMIT_TREL = 40,
        UPPER_TEMP_LIMIT_TIC20 = 60,
        UPPER_TEMP_LIMIT_TIC45 = 60,
        UPPER_TEMP_LIMIT_TICT = 60,
        UPPER_TEMP_LIMIT_ISOTAG = 60,
        NO_UPPER_TEMP_LIMIT = 500,
        NO_LOWER_TEMP_LIMIT = -273
    }

    // LogTag start methods (wStartMethod & wStartMethodSupported)
    public enum LTIS2 : uint // -2 because LTIS is already defined for other use
    {
        BUTTON = 0x0001,
        TIME = 0x0002,
        BUTTON_SLEEP = 0x0003,
        CAN_BUTTON_SLEEP = 0x0008   // LogTag supports push button start from hibernation, used in wStartMethodSupported only
    }

    // LogTag flag masks
    public enum LTIF : uint
    {
        LOGGING_CONTINOUS = 0x0001,
        LOGGING_CURRENTLY = 0x0002,
        ENABLE_PRESTART = 0x0004,
        LEASE_CONTROL = 0x0008,
        TIMEZONE_DAYLIGHT = 0x0010,
        TIMEZONE_KNOWN = 0x0020,
        PASSWORD_ENABLED = 0x0040,
        PASSWORD_LOCKED = 0x0080,
        DOWNLOAD_STOP = 0x0100,
        DISABLE_LOGGING = 0x0200,
        CAN_HIBERNATE = 0x0400,
        PASSWORD_DOWNLOAD = 0x0800,
        PRESET_SUPERUSER = 0x1000,
        CAN_PASSWORD_DOWNLOAD = 0x2000
    }

    // LogTag reading flags
    public enum LTRF : uint
    {
        WRAPPED_PRESTART_LOG = 0x0001,
        WRAPPED_MAIN_LOG = 0x0002
    }

    // LogTag ExtraFlag masks, LOGTAG_INFO dwExtraFlags
    public enum LTEF : uint
    {
        REPLACEABLE_CELL = 0x00000001,          // battery is replaceable
        FIXED_CELL = 0x00000002,                // battery is not replaceable
        TRID_FW = 0x00000004,                   // TRID30-7FW
        SLTD = 0x00000010,	                    // LOGTAG_INFO contains only selected readings (.sltd file)
        UPDATE_PRESET = 0x00000040,             // configuration cannot be updated with LogTag Analyzer because the max. number of starts has been reached
        TRID_FW_SLEEP_START = 0x00000100,	    // TRID30-7FW, or format version 2 TRID/TRED/PTID/PTED that has been downloaded with a LogTag Analyzer version that supports the automatic sleep start calculation
        TRID_CAN_FORMAT_UPGRADE_2 = 0x00000200,	// TRID/TRED/PTID/PTED with format version 0 or 1, can be upgraded to support hibernate flag/TRID30-7FW re-configuration
        BATTERY_WARNING = 0x00000400,	        // battery calculation cannot be relied on due to invalid battery management values
        RTC_INVALID = 0x00000800,               // Real time clock of indicator is invalid, download date is assumed as end date 
        CAN_FORMAT_VER_UPDATE = 0x00001000,	    // a format version update is available 
        CAN_ADVANCED_ALERT = 0x00002000,	    // can handle advanced alert settings (SRIL/TRIL)
        CAN_GENERATE_FILES = 0x00004000,	    // read-only: USB logger can generate files
        CAN_ADVANCED_USRIC = 0x00008000,	    // read-only: USRIC logger has advanced functions enabled: CSV file generation, MKT calculation, pdf Time zone
        CAN_12HR_DISPLAY = 0x00010000,	        // read-only: USB logger can be programmed to use 12-hour display in PDF, CSV file
        NEED_FW_UPDATE = 0x00020000,            // read-only: firmware upgrade is strongly recommended before configuring logger
        EXPANDED_DELAY_VALUES = 0x00040000,     // read-only: LogTag has 2 Byte values for Alert Delay meaning values can exceed 256 counts
        CAN_HOLDOFF	= 0x00080000,	            // read-only: LogTag firmware supports the feature "prioritise download over pdf file generation", a format update may be required (indicated in flag LTEF_CAN_FORMAT_VER_UPDATE)
        CAN_QUICKSTART = 0x00100000,	        // read-only: LogTag firmware supports Quick start/stop
        IN_VERIFICATION_MODE = 0x00200000,	    // read-only: LogTag is in verification mode (indicators only)
        IN_VERIFICATION_MODE_LOCKED = 0x00400000 // read-only: LogTag is in verification mode, locked in verification mode (single trip has been used, indicators only)
   }

    // LogTag DACONTROL flags (TRID)
    public enum LTDC : uint
    {
        ENABLE_LCD = 0x8000,            // LCD on
        POWER_SAVE = 0x4000,            // switch LCD off (power save mode) if no button activated for 30 seconds
        LOOKUP_EEPROM = 0x2000,	        // set: Use lookup table in EEPROM, otherwise use internal table
        SHOW_THRESHVIEW	= 0x1000,	    // USRIC only: set: show all limit value and duration screens during review. Not set: only MIN MAX screens will be shown
        INTERNAL_LOOKUP = 0x1000,	    // internal use only
        DIAGMODE = 0x0800,              // internal use only
        ENABLE_STOP = 0x0400,           // recording can be stopped with STOP button
        CLEAR_MINMAX_ENABLE = 0x0400,	// Display loggers only: set: enable the clearing process for min and max values. Not set: disable the process.
        ENABLE_RESTART = 0x0200,        // logger can be reset/restarted after logging has been stopped
        DISPLAY_FAHRENHEIT = 0x0100,    // not set: Display unit is Celsius
        BEEPER_INSTALLED = 0x0080,      // download only
        MASTER_ALARM_CLEAR = 0x0040,    // alarm clearable with CLEAR button
        MASTER_ALARM_LATCH = 0x0020,    // alarm latches
        SHOWTOTALSUMDAYS = 0x0010       // show number of summary days collected on recording and stopped display
    }

    // LogTag LCONTROL flags
    public enum LTLC : uint
    {
        USB_STOP = 0x00000001,	        // set to stop on USB enumeration
        DOWNLOAD_STOP = 0x00000002,	    // stop on download
        BUTTON_STOP = 0x00000004,	    // allow stop by push button
        RESTART = 0x00000010,	        // allow restart
        QUICKSTARTENABLE = 0x00000020,  // UTRID only
        USB_PAUSE = 0x00000040,	        // set to pause on USB enumeration
        INHIBIT_OK_LED = 0x00000080	    // inhibit OK LED
    }

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi, Size = 910)] 
    public struct LOGTAG_INFO
    {
        public UInt32 cbSize;
        public UInt16 wDeviceID;
        public UInt16 nFlags;
        public UInt16 wBattery;
        public UInt16 wBatteryVoltage;
        public Int32 lClockOffset;
        public Int32 lTimeZone;
        public UInt16 wStartMethod;
        public UInt16 wStartMethodSupported;
        public UInt32 dwNumOfStartsLife;
        public UInt32 dwNumOfStartsLease;
        public UInt32 dwNumOfStartsRemaining;
        public UInt32 dwStartDelay;
        public UInt32 dwLogInterval;
        public UInt32 dwMinLogInterval;
        public UInt32 dwMaxLogInterval;
        public UInt32 dwMaxReadings;
        public UInt32 dwMaxStartDelay;
        public SYSTEMTIME stStart;
        public SYSTEMTIME stFinish;
        public UInt32 dwNumReadingsToTake;
        public UInt16 wMaxChannelInfo;
        public UInt16 wMaxPassword;
        public UInt16 wMaxUserInfo;
        public UInt16 wChannelId;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32 * 2)]
        public byte[] szChannelInfo;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32 * 2)]
        public byte[] szPassword;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32 * 2)]
        public byte[] szProductId;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 16 * 2)]
        public byte[] szSerialNum;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 160 * 2)] // changed from length 128 in SDK 2.5
        public byte[] szUserInfo;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 16 * 2)]
        public byte[] szVersion;
        public UInt16 wNumOfSensors;
        public UInt16 wSensorCount;
        SYSTEMTIME stReadingFirst;
        SYSTEMTIME stReadingStart;
        public SYSTEMTIME stReadingLast;
        UInt16 nReadingFlags;
        UInt32 dwNumOfPreStart;
        UInt32 dwNumAfterStart;
        public UInt32 dwNumOfReadings;
        public UInt32 dwReadingsCount;
        //[MarshalAs(UnmanagedType.LPArray, ArraySubType=UnmanagedType.Struct)]
        //[MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 0)]
        public LOGTAG_SENSOR[] pSensor;
        //[MarshalAs(UnmanagedType.LPArray, ArraySubType=UnmanagedType.Struct)]
        //[MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 0)]
        public LOGTAG_READING[] pReading;
        public SYSTEMTIME stAquired;
        public Int32 lAquiredTimeZone;
        UInt32 dwDurationLimit;
        UInt32 dwMaxDuration;
        UInt32 dwMaxTimeStartDelay;
        UInt32 dwDurationRemainLife;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 3)]
        public byte[] baAlertControlByte;	// TRID alert control information
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 3)]
        public byte[] baAlertDelay;			// TRID alert delay values
        [MarshalAsAttribute(UnmanagedType.ByValArray, SizeConst = 3)]
        public float[] fAlertThreshVal;		// TRID alert threshold values
        UInt16 wDAControl;				    // TRID Display and master alarm control
        UInt32 dwExtraFlags;			    // additional flags, as nFlags insufficient3
        Int32 lDisplayClockOffset;		    // TRID Display clock offset in seconds, max +-24hrs
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32)]
        public byte[] baPassword;		    // new in 2.2r12: Read-only. Can be used to compare Unicode composite characters
        UInt32 dwCodePage;				    // Code page used for storage of szUserInfo and szPassword 
        UInt16 wProfileNumber;			    // new in 2.3r23, used for TIC profile number
        public LOGTAG_PDF_INFO[] pPDFInfo;	// added in 2.5r1: additional information for PDF loggers, this can be set/retrieved with extra parameter in GetInfo3() and SetInfo3()
        UInt32 dwLControl;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 6)]
	    public byte[] baMultiAlertControlByte;  // Extended alert control information for multi-alarm loggers (UTRID-16, UTRIX-16M, USRIC-8M)
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 6)]
	    public float[] fMultiAlertThreshVal;	// Exytended alert threshold information for multi-alarm loggers (UTRID-16, UTRIX-16M, USRIC-8M)
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 6)]
	    public UInt16[] waMultiAlertDelay;		// Extended alert delay information for multi-alarm loggers (UTRID-16, UTRIX-16M, USRIC-8M)
    };

    // LogTag Digital Signature flags
    public enum LTDSF : uint
    {
        VALID = 0x0001,
        DAYLIGHT_TIME = 0x0002
    }

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_DIGITAL_SIGNATURE
    {
        UInt32 cbSize;
        UInt32 nFlags;
        UInt32 dwUserId;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64 * 2)]
        public byte[] szUsername;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        public byte[] szFullname;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        public byte[] szDescription;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        public byte[] szEmail;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        public byte[] szIssuer;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 256 * 2)]
        public byte[] szSignature;
        SYSTEMTIME stTimeStamp;
        long lTimeZoneBias;
    };

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_SDKMEM
    {
        public UInt32 cbSize;
        public UInt32 dwAlloc;
        public UInt32 dwCount;
        public byte[] pbData;
    };

    // LogTag User flags
    public enum LTUF : uint
    {
        VALID = 0x0001,
        ACCOUNT_LOCKED = 0x0002,
        PASSWORD_EXPIRED = 0x0004,
        PASSWORD_CAN_CHANGE = 0x0008,
        SESSION_IDLE_TIMEOUT = 0x0010,
        RESERVED_ADMIN = 0x0020  // this account represents the reserved administrator user account
    }
    // LogTag User Authority flags
    public enum LTUA : uint
    {
        DOWNLOAD = 0x0001,
        CONFIGURE = 0x0002,
        HIBERNATE = 0x0004,
        OPTIONS_AUTOMATION = 0x0010,
        OPTIONS_CHART = 0x0020,
        OPTIONS_COMPORTS = 0x0040,
        OPTIONS_DATA = 0x0080,
        OPTIONS_DATETIME = 0x0100,
        OPTIONS_FOLDERS = 0x0200,
        OPTIONS_FONTS = 0x0400,
        OPTIONS_GENERAL = 0x0800,
        OPTIONS_SERVER = 0x1000,
        OPTIONS_EXPORTS = 0x2000,
        OPTIONS_STATISTICS = 0x4000
    }

    // LogTag Calibration Set flags
    public enum LTCALSET : uint
    {
        CAN_RESTORE = 0x0001,
        DEFAULT = 0x0002,
        CANBACKUP = 0x0004,
        BACKUP = 0x0008,
        UNCHANGED = 0x0010
    };

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_CAL_POINT
    {
        double dReference;
        double dRecording;
    };

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_CAL_SET
    {
        UInt16 nFlags;
        UInt16 wScale;			// scale of values in CalPoint[]
        UInt16 wCount;			// number of calibration value pairs
        UInt16 wCorrCount;		// number of correction value pairs within CalPoint[] (TRIX temp correction)
        UInt16 wMinCount;
        UInt16 wMaxCount;
        UInt16 wEnviroScale;	// scale for environment temperature (hum. calibration only) 
        double dEnviroValue;	// environment temperature (humidity calibration)
        [MarshalAs(UnmanagedType.LPArray, SizeConst = 16)]
        LOGTAG_CAL_POINT[] CalPoint;
    };

    // LogTag Calibration flags
    public enum LTCAL : uint
    {
        KEEP_READINGS = 0x0001,
        UPDATE_ANYWAY = 0x0002 // update calibration even if parameters result in incomplete calibration
    };

    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_CALIBRATION
    {
        UInt32 cbSize;
        UInt32 nFlags;
        UInt16 wInstallKey;	// 0: LogTag internal, 1 - 254: from authorisation code, 255: SDK reserved
        LOGTAG_CAL_SET CalSetTemp;		// factory calibration + correction table
        [MarshalAs(UnmanagedType.LPArray, SizeConst = 2)]
        LOGTAG_CAL_SET[] CalSetHumidity;
    };

    // structure for the TRID day statistics information (one day)
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_DAY_STATS
    {
        public double dMaxValue;				// maximum temperature for the day
        public UInt16 wMaxAttributes;			// LTRA_ABOVEALERT or LTRA_BELOWALERT, indicates if the current max value is above the alert threshold 
        public double dMinValue;				// minimum temperature for the day
        public UInt16 wMinAttributes;			// LTRA_ABOVEALERT or LTRA_BELOWALERT, indicates if the current min value is below the alert threshold 
        public bool bUpperAlarmTriggered;	    // true if alarm condition has been reached (alert threshold plus alert delay)
        public UInt16 wDurationAboveUpperAlert;	// duration above upper alert in minutes (max. 23 hours, 59 minutes), 0 if alert has not been triggered
        public bool bLowerAlarmTriggered;	    // true if alarm condition has been reached (alert threshold plus alert delay)
        public UInt16 wDurationBelowLowerAlert;	// duration below lower alert in minutes (max. 23 hours, 59 minutes), 0 if alert has not been triggered
        public bool bAlarmTriggered;		    // true if alarm triggered on the day (as per display)
    };

    // structure for the TRID day summary information (up to 30 days)
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_DAY_SUMMARY
    {
        public UInt16 wNumDayStats;	// number of day statistics fields used in DayStats array
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 30)]
        public LOGTAG_DAY_STATS[] DayStats;		// statistics for the last 30 days, 0 :Current day, 1 is -1 day, etc.
    };

    // structure for one alarm settings information in TIC day statistics
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_ALARM_SETTINGS_TIC
    {
        public double dAlarmThreshold;			// alarm temperature, in deg Celsius
        public UInt16 wAlarmDelayCount;			// number of readings to delay alarm display
        public UInt16 wAlarmControl;			// alarm control
    }

    // structure for one alarm information in TIC day statistics
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_ALARM_STATS_TIC
    {
        public UInt16 wAlarmCount;			// number of readings beyond alarm temperature
        public UInt16 wTriggerTime;			// time first alarm triggered
    }

    // structure for the TIC day statistics information (one day)
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_DAY_STATS_TIC
    {
        public double dMaxValue;				// maximum temperature for the day
        public double dMinValue;				// minimum temperature for the day
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public LOGTAG_ALARM_STATS_TIC[] AlarmStats;
        public UInt32 dwAttributes;             // LTRA_ reading attribute values
    }

    // structure for the TIC day summary information (up to 45 days)
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_DAY_SUMMARY_TIC
    {
        public UInt16 wNumDayStats;		            // number of day statistics fields used in DayStats array
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 45)]
        public LOGTAG_DAY_STATS_TIC[] DayStats;		// statistics up to 45 days
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 4)]
        public LOGTAG_ALARM_SETTINGS_TIC[] AlarmSettings;	// alert settings
        public UInt16 wDAControl1;
        public UInt16 wDAControl2;
    }

    // structure for the iS0Tag day summary information (up to 1096 days)
    [StructLayout(LayoutKind.Sequential, Pack = 2, CharSet = CharSet.Ansi)]
    public struct LOGTAG_DAY_SUMMARY_IS0TAG
    {
        public UInt16 wNumDayStats;		// number of day statistics fields used in DayStats array
        public LOGTAG_DAY_STATS_TIC[] DayStats;	        // day statistics array, variable length, needs to be retrieved separately
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 2)]
        public LOGTAG_ALARM_SETTINGS_TIC[] AlarmSettings;
        public byte bEndOfLifeDays;		// number of days before calculated end of life, before the "battery low" symbol is displayed
        public UInt16 wDAControl1;
        public UInt16 wDAControl2;
        public UInt32 dwRunTime;          // total run time in minutes
        public double dTripMin;			// overall trip statistics
        public double dTripMax;
        public UInt32 dwLowerTriggerTime; // time lower alarm triggered in minutes from start
        public UInt32 dwUpperTriggerTime;
        public SYSTEMTIME stFirstDay;			// Date/time of first day statistic
    }

    // TIC alarm control flags used in LOGTAG_ALARM_SETTINGS_TIC.wAlarmControl
    public enum TIC_ALARM : uint
    {
        ENABLED = 0x80,
        DELAY_ENABLED = 0x40,
        DELAY_CONSEC = 0x20,            // set: consecutive alert delay, not set: accumulative
        DELAY_ALERT_REJECT = 0x10,      // set: reject, not set: warning
        INSTANT_ALERT = 0x08,
        INSTANT_ALERT_REJECT = 0x04,    // set: reject, not set: warning
        RESERVED = 0x02,                // not used
        DIRECTION = 0x01                // set: upper, not set: lower
    }

    // TIC DACONTROL1 flags
    public enum TIC_DACONTROL1 : uint
    {
        POWERSAVE2 = 0x80,              // hibernate indicator during STOPPED mode
        POWERSAVE1 = 0x40,              // turn display off
        LOOKUPTABLE = 0x20,             // set: PMEM, not set: EEPROM
        IS0TAG_LOG_ENABLE = 0x20,       // set: Enable wraparound logging (iS0Tag only)
        ALERT_FLASH = 0x10,             // flashing alert symbols while logging (TIC45 only)
        IS0TAG_STATS_ENABLE = 0x10,     // Enable storage of day stats (iS0Tag only)
        DIAGMODE = 0x08,                // diagnostics mode
        IS0TAG_BATTERY_TEST = 0x08,     // 1: Enabled (iS0Tag only)
        ALLOWSTOP = 0x04,               // allow sto logging with STOP button
        ALLOWRESTART = 0x02,            // allow restart with START button
        UNIT_DEGF = 0x01                // display unit, set: Fahrenheit, not set: Celsius
    }

    // TIC DACONTROL2 flags
    public enum TIC_DACONTROL2 : uint
    {
        RESERVED1 = 0x80,               // not used
        RESERVED2 = 0x40,               // not used
        IS0TAG_DELAY_STOP = 0x40,       // Set: delay stop for 270 readings on alarm trigger, not set: Stop indicator immediately after alarm condition reached (iS0Tag only)
        RESERVED3 = 0x20,               // not used
        TIME_LAPSE_MODE = 0x10,         // 2 hours in one day mode, used for production freezer tests
        SHOW_MIN_MAX_STATS = 0x08,      // TIC20 firmware version 9.2
        ARROW_ICON = 0x04,              // set: enable alarm arrow/icons when alarm triggered
        ARROW_ALARM = 0x02,             // set: enable display of alarm icons when arrow on (TIC20)
        ALARM_SYMBOL = 0x01             // set: enable "ALARM" symbol during logging (TIC20)
    }

    // TIC status
    public enum TIC_SSTATUS1 : uint
    {
        READY = 0x00,
        MONITORING = 0x01,
        STOPPED = 0x10,
        UNCONFIGURED = 0x11,
    }

    public class LogTag
    {

        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_OpenAccess", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern LOGTAG_HANDLE OpenAccess(HINSTANCE hInstance);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_AddSignature", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint AddSignature(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_DIGITAL_SIGNATURE[] lpSignature); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_AttachIO", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint AttachIO(LOGTAG_HANDLE handle, HANDLE hPort, UInt16 wPortType); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_AttachIO_1", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint AttachIO_1(LOGTAG_HANDLE handle, HANDLE hPort, UInt16 wPortType, UInt16 wFlags); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_ChangeUserPassword", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint ChangeUserPassword([MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_USER[] lpUser, string lpszPassword); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_Close", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint Close(LOGTAG_HANDLE handle); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_CloseIO", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint CloseIO(LOGTAG_HANDLE handle); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetAppName", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetAppName(Guid guid, string lpszAppName, ref UInt32 chAppName); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetCal", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetCal(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_CALIBRATION[] pLogTagCal); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetData", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetData(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pInfo);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetData2", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetData2(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pInfo, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SENSOR[] pSensor, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_READING[] pReading);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetDaySummary", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetDaySummary(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_DAY_SUMMARY[] pDaySummary);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetDaySummaryTIC", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetDaySummaryTIC(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_DAY_SUMMARY_TIC[] pDaySummary);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetDaySummaryiS0TagNET", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetDaySummaryiS0TagNET(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_DAY_SUMMARY_IS0TAG[] pDaySummary, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_DAY_STATS_TIC[] pDayStats);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetErrorInfo", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetErrorInfo(LOGTAG_HANDLE handle, string lpszContext, UInt32 cbSize); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetInfo", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetInfo(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetInfo1", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetInfo1(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo, UInt16 nDownload); // NOT to be used with .NET wrapper
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetInfo2", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetInfo2(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SENSOR[] pLogTagSensor);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetInfo3", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetInfo3(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SENSOR[] pLogTagSensor, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_PDF_INFO[] pPdfInfo);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetInterface", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetInterface(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INTERFACE[] pPortInfo);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetPortInfo", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetPortInfo([MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_PORTINFO[] pPortInfo, ref UInt32 nCount, UInt16 wPortType);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetPortType", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetPortType(UInt16 wPortType); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetSDKMemory", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetSDKMemory(LOGTAG_HANDLE handle, UInt16 nPageId, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SDKMEM[] pMemInfo); // do not use with .NET
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetSDKMemoryNET", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetSDKMemoryNET(LOGTAG_HANDLE handle, UInt16 nPageId, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SDKMEM[] pMemInfo, IntPtr lpData);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetServer", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetServer(Guid guid, ref UInt16 nPortNum, string lpszServer, UInt32 chServer); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetSignatures", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetSignatures(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_DIGITAL_SIGNATURE[] lpSignature, ref UInt32 nCount); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetUploadCalCount", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetUploadCalCount(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_CALIBRATION[] pLogTagCal, ref UInt32 nCount); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetUploadMemCount", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetUploadMemCount(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo, ref UInt32 nCount); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GetUploadSDKCount", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GetUploadSDKCount(LOGTAG_HANDLE handle, UInt16 nPageId, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SDKMEM[] pMemInfo, ref UInt32 dwCount); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_GivePassword", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint GivePassword(LOGTAG_HANDLE handle, string lpszPassword); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_Hibernate", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint Hibernate(LOGTAG_HANDLE handle);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_IsOpenIO", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint IsOpenIO(LOGTAG_HANDLE handle); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_LogOffUser", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint LogOffUser(); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_LogOnUser", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint LogOnUser([MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_USER[] lpUser, string lpszUsername, string lpszPassUInt16);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_OpenIO", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint OpenIO(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_PORTINFO[] pPortInfo);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_OpenPath", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint OpenPath(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPWStr)] string lpszPathName); 
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_PingServer", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint PingServer(UInt16 nPortNum, string lpszServer); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_QuerySensors", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint QuerySensors(LOGTAG_HANDLE handle, UInt16 wSensorCount, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_READING[] pReadings); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_RefreshLEDMode", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint RefreshLEDMode(LOGTAG_HANDLE handle, Byte bLEDMode);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_Reset", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint Reset(byte[] lpData, UInt32 cbData); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_ResetAuthorisation", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint ResetAuthorisation(byte[] lpAuthorisation, UInt32 cbAuthorisation); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_ResetData", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint ResetData(LOGTAG_HANDLE handle); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SaveData", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SaveData(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPWStr)] string lpszPathName); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetAppName", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetAppName(Guid guid, string lpszAppName, UInt16 nFlags); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetCal", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetCal(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_CALIBRATION[] pLogTagCal, UInt32 nAttributes); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetData", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetData(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetFeedback", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetFeedback(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_FEEDBACK[] pFeedbackProc, UInt64 ullHookParam); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetFormatVersion", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetFormatVersion(LOGTAG_HANDLE handle, byte bFormatVersion);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetInfo", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetInfo(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetInfoTime", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetInfoTime(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SENSOR[] pLogTagSensor, SYSTEMTIME stTime);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetInfo2", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetInfo2(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SENSOR[] pLogTagSensor);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetInfo3", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetInfo3(LOGTAG_HANDLE handle, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_INFO[] pLogTagInfo, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SENSOR[] pLogTagSensor, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_PDF_INFO[] pPdfInfo);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetInterfaceSpeed", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetInterfaceSpeed(LOGTAG_HANDLE handle, UInt32 nMaximum); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetLEDMode", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetLEDMode(LOGTAG_HANDLE handle, Byte bLEDMode); 
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetSDKMemory", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetSDKMemory(LOGTAG_HANDLE handle, UInt16 nPageId, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SDKMEM[] pMemInfo); // do not use with .NET
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetSDKMemoryNET", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetSDKMemoryNET(LOGTAG_HANDLE handle, UInt16 nPageId, [MarshalAs(UnmanagedType.LPArray)] [In, Out] LOGTAG_SDKMEM[] pMemInfo, IntPtr lpData);
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetServer", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetServer(Guid guid, UInt16 nPortNum, string lpszServer); //NOT TESTED
        [DllImport("LogTagIO29.dll", EntryPoint = "LogTag_SetOptions", ExactSpelling = false, CallingConvention = CallingConvention.StdCall)]
        public static extern uint SetOptions(UInt32 nOptions);
    }
}
