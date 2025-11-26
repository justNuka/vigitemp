'use server'

import axios, { Axios } from "axios";
import { GetServerSideProps } from "next";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

export async function formatDate(date: Date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export const setLocalIP = async (ip: string) => {
    // console.log("---------------------------------------------------------------------setlocalip---------------------------------------------------------")
    // const ip = await getServerSideProps();
    const cookieStore = await cookies();
    // console.log(ip.props.localIP)
    cookieStore.set('IP_ADDRESS', ip);
}

export const getLocalIP = async () => {
    // const ip = await getServerSideProps();
    const cookieStore = await cookies();
    const ip:string = cookieStore.get('IP_ADDRESS')?.value!;
    // console.log("COOKIE_IP:"+ip);
    return ip;
}

export const POST_disableNotification = async (element: string, idLieu: number) => {
    const axios_custom = axios.create();
    axios_custom.defaults.timeout = 150;
    await axios_custom.post("http://" + element + ":8000/alarm?action=hide&idLieu=" + idLieu, 
        {
            mode: 'no-cors',
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }
    )
    .catch(()=>{
        console.log("erreur pour "+ element)
    })
}

export const POST_enableNotification = async (element: string, idLieu: number) => {
    const axios_custom = axios.create();
    axios_custom.defaults.timeout = 150;
    await axios_custom.post("http://" + element + ":8000/alarm?action=show&idLieu=" + idLieu, 
        {
            mode: 'no-cors',
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }
    )
    .catch(()=>{
        console.log("erreur pour "+ element)
    })
}

// export const getLocalIPv2 = async () => {
//     const ip = await getServerSidePropsv2();
//     const cookieStore = await cookies();
//     const ip:string = cookieStore.get('IP_ADDRESS')?.value!;
//     // console.log("COOKIE_IP:"+ip);
//     return ip;
// }


// export async function getServerSideProps() {
//   const os = require('os');
//     // This will run on the server and get the local IP address
//     function getLocalIP() {
//       try {
//         const networkInterfaces = os.networkInterfaces();
//         console.log(networkInterfaces)
  
//         for (const interfaceKey in networkInterfaces) {
//           const interfaces = networkInterfaces[interfaceKey];
//           for (const net of interfaces) {
//             if (net.family === 'IPv4' && !net.internal) {
//               console.log("Client IP:", net.address); // Debugging log
//               return net.address;
//             }
//           }
//         }
  
//         console.log("No local IP found");
//         return null;  // In case no IP address is found
//       } catch (error) {
//         console.error("Error getting local IP:", error); // Error log
//         return null;
//       }
//     }
  
//     const localIP = getLocalIP(); // Synchronous call
  
//     // console.log("Local IP returned:", localIP); // Check what IP is returned
  
//     return {
//       props: {
//         localIP: localIP || 'IP not found',
//       },
//     };
//   }

//   export const getServerSidePropsv2: GetServerSideProps = async ({ req }) => {
//     let ip = req.headers["x-real-ip"];
//     if (!ip) {
//       const forwardedFor = req.headers["x-forwarded-for"];
//       if (Array.isArray(forwardedFor)) {
//         ip = forwardedFor.at(0);
//       } else {
//         ip = forwardedFor?.split(",").at(0) ?? "Unknown";
//       }
//     }
//     return {
//       props: {
//         ip,
//       },
//     };
//   };
  
// export formatDate;