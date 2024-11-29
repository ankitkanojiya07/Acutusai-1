const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config");

const DeviceInfo = sequelize.define(
  "DeviceInfo",
  {
    FingerPrintID: {
      type: DataTypes.STRING,
      allowNull: false,

    },
    UserAgent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DeviceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Browser: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IpAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIP: true,  // Validate IP address format
      },
    },
    PanelistId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OperatingSystem: {
      type: DataTypes.STRING,
    },
    ScreenResolution: {
      type: DataTypes.STRING,
    },
    ColorDepth: {
      type: DataTypes.INTEGER,
    },
    TimeZone: {
      type: DataTypes.STRING,
    },
    Language: {
      type: DataTypes.STRING,
    },
    IsTouchDevice: {
      type: DataTypes.BOOLEAN,
    },
    CookiesEnabled: {
      type: DataTypes.BOOLEAN,
    },
    JavaEnabled: {
      type: DataTypes.BOOLEAN,
    },
    Platform: {
      type: DataTypes.STRING,
    },
    Referrer: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,  // Validate that the referrer is a URL
      },
    },
    NetworkType: {
      type: DataTypes.STRING,
    },
    DeviceMemory: {
      type: DataTypes.FLOAT,  // Device memory in GB
    },
    HardwareConcurrency: {
      type: DataTypes.INTEGER,  // Number of logical CPU cores
    },
    BatteryLevel: {
      type: DataTypes.FLOAT,  // Battery level as a percentage
    },
    GpuVendor: {
      type: DataTypes.STRING,
    },
    GpuRenderer: {
      type: DataTypes.STRING,
    },
    BrowserPlugins: {
      type: DataTypes.JSON,  // Array of browser plugin names
    },
    CanvasFingerprint: {
      type: DataTypes.STRING,  // Unique canvas fingerprint
    },
    WebGLFingerprint: {
      type: DataTypes.STRING,  // Unique WebGL fingerprint
    },
    AudioFingerprint: {
      type: DataTypes.STRING,  // Audio fingerprint
    },
    Timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,  // Automatically add `createdAt` and `updatedAt` fields
  }
);

module.exports = DeviceInfo;
