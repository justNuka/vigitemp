const installEvent = () => {
  self.addEventListener("install", () => {
    console.log("service worker installed");
  });
};
installEvent();

const activateEvent = () => {
  self.addEventListener("activate", () => {
    console.log("service worker activated");
  });
};
activateEvent();

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "Alarme Vigitemp";
  const body = data.body || "Une alarme a été déclenchée.";
  const tag = data.tag || "alarm";
  const notificationData = data.data || {};

  const notificationOptions = {
    body,
    tag,
    data: notificationData,
  };

  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/dashboard/surveillance";
  event.waitUntil(self.clients.openWindow(url));
});

