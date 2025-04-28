export default {
  expo: {
    name: "AcilKanBagisiMobile",
    slug: "AcilKanBagisiMobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: "AIzaSyBALiEI_RbjdpxsRX1kAhG2mDNLRakV98M"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: "AIzaSyBALiEI_RbjdpxsRX1kAhG2mDNLRakV98M"
        }
      },
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "İhtiyaç halinde kan bağışı merkezlerini bulabilmek için konum izni gereklidir."
        }
      ],
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
}; 