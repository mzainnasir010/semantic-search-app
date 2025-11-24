export default {
  expo: {
    name: "semantic-search-app",
    slug: "semantic-search-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    extra: {
      backendUrl: process.env.BACKEND_URL 
    }
  }
};