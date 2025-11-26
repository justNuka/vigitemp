const installEvent = () => {
  self.addEventListener('install', () => {
    console.log('service worker installed');
  });
};
installEvent();

const activateEvent = () => {
  self.addEventListener('activate', () => {
    console.log('service worker activated');
  });
};
activateEvent();


//   self.addEventListener('push',(event) => {
//     const data = event.data.json();
//     console.log(data);
//     const title = data.title;
//     const body = data.message;
//     const icon = 'some-icon.png';
//     const notificationOptions = {
//       body: body,
//       tag: 'simple-push-notification-example',
//       icon: icon
//     };
// //    self.Notification.requestPermission
//     self.Notification.requestPermission().then((permission) => {
//       if (permission === 'granted') {
//         return new self.Notification(title, notificationOptions);
//       }
//     });
//    });

 self.addEventListener('push', function(event) {
  console.log("notif arrivée");
  const title = "titre";
  const body = "message";
  const notificationOptions = {
    body: body, 
    tag: 'simple-push-notification-example' 
  };
  // const data = event.data.json();
  // console.log(data);
  // const title = data.title;
  // const body = data.message;
  // const notificationOptions = {
  //   body: body,
  //   tag: 'simple-push-notification-example'
  // };
  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});