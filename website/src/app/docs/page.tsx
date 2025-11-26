'use client';

import Image from 'next/image';
import styles from '@/app/styles/Home.module.css';
import axios from 'axios';

export default function Docs() {
  // useEffect(() => {
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker
  //       .register('/service-worker.js')
  //       .then((registration) => console.log('scope is: ', registration.scope));
  //   }
  // }, []);
  return (
    <>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Service Worker Docs</p>
          <div>
            <a onClick={askPermission} target="blank" className="hover:underline">
            requestPermission
            </a>
            <a onClick={subscribeUserToPush} target="blank" className="hover:underline">
            subscribe
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src='/next.svg'
            alt='Next.js Logo'
            width={180}
            height={37}
            priority
          />
        </div>
      </main>
    </>
  );
}

function askPermission() {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then(function (permissionResult) {
    if (permissionResult !== 'granted') {
      throw new Error("We weren't granted permission.");
    }
  });
}

function subscribeUserToPush() {
  return navigator.serviceWorker
    .register('service-worker.js')
    .then(function (registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BNYQUXO1dCbcu5JB4kTb-hOX7JgJSMigJtXJHMHeWpRUuNOs38yVvBHJ4jA6N68EHKttOBCIUzu2n28jdoJ6i1Y',
        ),
      };

      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(async function (pushSubscription) {
        console.log(
            'Received PushSubscription: ',
            JSON.stringify(pushSubscription),
        );
        const res = JSON.parse(JSON.stringify(pushSubscription))
        await axios.post('/api/alarms', 
            {
                "pushEndPoint": res.endpoint,
                "p256dh": res.keys.p256dh,
                "auth": res.keys.auth
            })
        .then(() => {
            console.log("Done");
        });
        return pushSubscription;
    });
}

function urlBase64ToUint8Array(base64String: string) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// async function askToSuscribe(){
//   await navigator.serviceWorker.register("/service-worker.js");

//   // Use serviceWorker.ready to ensure that you can subscribe for push
//   navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
//     // const options = {
//     //   userVisibleOnly: true,
//     //   applicationServerKey,
//     // };
//     serviceWorkerRegistration.pushManager.subscribe().then(
//       (pushSubscription) => {
//         console.log(pushSubscription.endpoint);
//       // The push subscription details needed by the application
//       // server are now available, and can be sent to it using,
//       // for example, the fetch() API.
//       },
//       (error) => {
//       // During development it often helps to log errors to the
//       // console. In a production environment it might make sense to
//       // also report information about errors back to the
//       // application server.
//         console.error(error);
//       },
//     );
//   });
// }
// async function askToSuscribe(){
//   let key = "key to Susbscribe"
//   console.log("subscribe with key " + btoa(key));
//   let key_2 = await navigator.serviceWorker.register("/service-worker.js")
//   key_2.pushManager.subscribe();

//   // console.log("key_2: "+key_2.);
// }
// async function askToSuscribe(){
//   let key = "key to Susbscribe"
//   console.log("subscribe with key " + btoa(key));
//   let key_2 = await navigator.serviceWorker
//  .register("/service-worker.js")
//  .then(() =>
//    console.log("edzaqsdqds")
// //  .then((registration) =>
// //    registration.pushManager.subscribe({
// //      userVisibleOnly: true,
// //      applicationServerKey: 'a2V5IHRvIFN1c2JzY3JpYmU'
// //    })
//  );
//  console.log(key_2);
// }