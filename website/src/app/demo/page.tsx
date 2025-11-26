'use client';


// import dotenv from "dotenv";
// dotenv.config();

// console.log(process.env.VAPID_PUBLIC_KEY);





// Chart.register(annotationPlugin);


// const registerSW = async () => {
//   console.log(process.env);
//   console.log(process.env.VAPID_PUBLIC_KEY);
//   // const registration = await navigator.serviceWorker.register(`${process.env.REACT_APP_PUBLIC_URL}/serviceWorker.js`);
//   // let registration;
//   // useEffect((registration) => {
//     let registration = await navigator.serviceWorker.register('demo/serviceWorker.js');
//   // })
//   return registration;
  
// }

// registerSW();


export default function about() {

    return (
        <>
            <main className="flex flex-col items-center pt-10 m-auto h-[50%] ">
                <div className="h-[50%] w-[80%] grid grid-cols-2">
                  <div id="div-acquisitions" className="bg-blue-50 rounded-lg m-4 h-400 shadow-md">
                    <canvas id="acquisitions" className="mx-auto w-full"/>
                  </div>
                  <div id="div-acquisitions2" className="bg-blue-50 rounded-lg m-4 h-400 shadow-md">
                    <canvas id="acquisitions2" className="mx-auto w-full" />
                  </div>
                  <div id="div-acquisitions3" className="bg-blue-50 rounded-lg m-4 h-400 shadow-md">
                    <canvas id="acquisitions3" className="mx-auto w-full"/>
                  </div>
                  <div id="div-acquisitions4" className="bg-blue-50 rounded-lg m-4 h-400 shadow-md">
                    <canvas id="acquisitions4" className="mx-auto w-full"/>
                  </div>
                </div>
            </main>
        </>
    )
}



// (async function() {

  // const alert = useAlert();
    // const data;
  //   await axios.get('/api/mesures/INX08J/20')
  //     .then(response => {
  //       const data = response.data.sort(function(a: any, b: any){
  //         // var date  = new Date(a);
  //         // console.log(new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //         return (new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //         // return a.DateHeureMesure - b.DateHeureMesure;
  //       });
  //       new Chart(
  //         document.getElementById('acquisitions') as HTMLCanvasElement,
  //         {
  //           type: 'line',
  //           data: {
  //             labels: data.map((row: { DateHeureMesure: any; }) => {
  //               return new Date(row.DateHeureMesure).getHours() + ":" + ('0' + new Date(row.DateHeureMesure).getMinutes()).slice(-2)
  //             }),
  //             datasets: [
  //               {
  //                 label: 'Temperature',
  //                 data: data.map((row: { Valeur: any; }) => row.Valeur)
  //               }
  //             ]
  //           },
  //           options: {
  //               tension:0.3,
  //               scales: {
  //                 y: {
  //                   grace: '20%', // Add 20% to min and max
  //                   // grace: 20 // Add 20 to min and max value always
  //                 }
  //               },
  //               plugins: {
  //                 title: {
  //                     display: true,
  //                     text: 'Sonde INX08J'
  //                 },
  //                 legend: {
  //                   display: false
  //                 }
  //               }
  //           }
  //         }
  //       );
  //       setInterval(function() { actualizeData("acquisitions", "INX08J"); }, 900000);
  //     });
   
  //     await axios.get('/api/mesures/INX08L/20')
  //     .then(response => {
  //       const data = response.data.sort(function(a: any, b: any){
  //         // var date  = new Date(a);
  //         // console.log(new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //         return (new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //         // return a.DateHeureMesure - b.DateHeureMesure;
  //       });
  //       new Chart(
  //         document.getElementById('acquisitions2') as HTMLCanvasElement,
  //         {
  //           type: 'line',
  //           data: {
  //             labels: data.map((row: { DateHeureMesure: any; }) => {
  //               return new Date(row.DateHeureMesure).getHours() + ":" + ('0' + new Date(row.DateHeureMesure).getMinutes()).slice(-2)
  //             }),
  //             datasets: [
  //               {
  //                 label: 'Temperature',
  //                 data: data.map((row: { Valeur: any; }) => row.Valeur)
  //               }
  //             ]
  //           },
  //           options: {
  //             tension:0.3,
  //               scales: {
  //                 y: {
  //                   grace: '20%', // Add 20% to min and max
  //                   // grace: 20 // Add 20 to min and max value always
  //                 }
  //               },
  //               plugins: {
  //                 title: {
  //                     display: true,
  //                     text: 'Sonde INX08L'
  //                 },
  //                 legend: {
  //                   display: false
  //                 }
  //               }
  //           }
  //         }
  //       );
  //       setInterval(function() { actualizeData("acquisitions2", "INX08L"); }, 900000);
  //     });

  //     await axios.get('/api/mesures/IEEGEE/20')
  //     .then(response => {
  //       // json.sort(function(a, b){
  //       //   return a.id - b.id;
  //       // });
      

  //       const data = response.data.sort(function(a, b){
  //                   // var date  = new Date(a);
  //                   // console.log(new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //                   return (new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //                   // return a.DateHeureMesure - b.DateHeureMesure;
  //                 });;
  //       new Chart(
  //         document.getElementById('acquisitions3') as HTMLCanvasElement,
  //         {
  //           type: 'line',
  //           data: {
  //             labels: data.map((row: { DateHeureMesure: any; }) => {
  //               return new Date(row.DateHeureMesure).getHours() + ":" + ('0' + new Date(row.DateHeureMesure).getMinutes()).slice(-2)
  //             }),
  //             datasets: [
  //               {
  //                 label: 'Temperature',
  //                 data: data.map((row: { Valeur: any; }) => row.Valeur)
  //               }
  //             ]
  //           },
  //           options: {
  //               tension:0.3,
  //               responsive: true,
  //               scales: {
  //                 y: {
  //                   grace: '20%', // Add 20% to min and max
  //                   // grace: 20 // Add 20 to min and max value always
  //                 }
  //               },
  //               plugins: {
  //                 title: {
  //                     display: true,
  //                     text: 'Sonde IEEGEE'
  //                 },
  //                 legend: {
  //                   display: false
  //                 }
  //               }
  //           }
  //         }
  //       );
  //       setInterval(function() { actualizeData("acquisitions3", "IEEGEE"); }, 900000);
      
  //     });



  //     await axios.get('/api/mesures/IN25EC/20')
  //     .then(response => {
  //       const data = response.data.sort(function(a, b){
  //         // var date  = new Date(a);
  //         // console.log(new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //         return (new Date(a.DateHeureMesure).getTime() - new Date(b.DateHeureMesure).getTime());
  //         // return a.DateHeureMesure - b.DateHeureMesure;
  //       });
  //       console.log(data);
  //       new Chart(
  //         document.getElementById('acquisitions4') as HTMLCanvasElement,
  //         {
  //           type: 'line',
  //           data: {
  //             labels: data.map((row: { DateHeureMesure: any; }) => {
  //               return new Date(row.DateHeureMesure).getHours() + ":" + ('0' + new Date(row.DateHeureMesure).getMinutes()).slice(-2)
  //             }),
  //             datasets: [
  //               {
  //                 label: 'Temperature',
  //                 data: data.map((row: { Valeur: any; }) => row.Valeur)
  //               }
  //             ]
  //           },
  //           options: {
  //               responsive: true,
            
  //               tension:0.3,
  //               scales: {
  //                 y: {
  //                   grace: '20%', // Add 20% to min and max
  //                   max: data[data.length-1].Consigne_Sup + 0.1*data[data.length-1].Consigne_Sup,
  //                   min: data[data.length-1].Consigne_Inf - 0.1*data[data.length-1].Consigne_Sup
  //                   // grace: 20 // Add 20 to min and max value always
  //                 }
  //               },
  //               plugins: {
  //                 title: {
  //                     display: true,
  //                     text: 'Sonde IN25EC'
  //                 },
  //                 legend: {
  //                   display: false
  //                 },
  //                 annotation: {
  //                   annotations: {
  //                     maximum: {
  //                       type: 'line',
  //                       label: {
  //                         display: true,
  //                         backgroundColor: 'rgba(102, 102, 102, 0.3)',
  //                         color: 'black',
  //                         content: data[data.length-1].Consigne_Sup +"°C",
  //                         position: 'start',
  //                         yAdjust: -16
  //                       },
  //                       yMin: data[data.length-1].Consigne_Sup,
  //                       yMax: data[data.length-1].Consigne_Sup,
  //                       borderColor: 'rgb(255, 99, 132)',
  //                       borderWidth: 2,
  //                     },
  //                     minimum: {
  //                       type: 'line',
  //                       label: {
  //                         display: true,
  //                         backgroundColor: 'rgba(102, 102, 102, 0.3)',
  //                         color: 'black',
  //                         content: data[data.length-1].Consigne_Inf +"°C",
  //                         position: 'start',
  //                         yAdjust: +16
  //                       },
                      
                      
  //                       yMin: data[data.length-1].Consigne_Inf,
  //                       yMax: data[data.length-1].Consigne_Inf,
  //                       borderColor: 'rgb(255, 99, 132)',
  //                       borderWidth: 2,
  //                     }
  //                   }
  //                 }
              
  //               }
  //           }
  //         }
  //       );
  //       setInterval(function() { actualizeData("acquisitions4", "IN25EC"); }, 5000);
  //     })
  
    
  // })();

  // async function actualizeData(_chartName: any, _serialNumber: string){
  //   var chart = Chart.getChart(_chartName);
  //   await axios.get('/api/mesures/'+_serialNumber+'/1')
  //   .then(response => {
  //     var arr1 = (new Date(response.data[0].DateHeureMesure).getHours() + ":" + ('0' + new Date(response.data[0].DateHeureMesure).getMinutes()).slice(-2));
  //     var arr2 = chart?.data.labels[chart.data.labels.length-1];

  //     // console.log(arr1 == arr2);
  //     // if(arr1 != arr2){
  //       chart?.data.labels?.push(arr1);
  //       // console.log(chart.data.labels.length);
  //       if (chart?.data.labels?.length >= 20){
  //         chart?.data.datasets[0].data.shift();
  //         chart?.data.labels.shift();
  //       }
  //       chart?.data.datasets[0].data.push(response.data[0].Valeur);

  //       //Consigne superieur
  //       chart.options.plugins.annotation.annotations.maximum.yMin = response.data[0].Consigne_Sup;
  //       chart.options.plugins.annotation.annotations.maximum.yMax = response.data[0].Consigne_Sup;
  //       chart.options.plugins.annotation.annotations.maximum.label.content = response.data[0].Consigne_Sup + "°C";
  //       chart.options.scales.y.max = response.data[0].Consigne_Sup + 0.1*response.data[0].Consigne_Sup;
  //       chart.options.scales.y.min = response.data[0].Consigne_Inf - 0.1*response.data[0].Consigne_Sup;

  //       //consigne inferieur
  //       chart.options.plugins.annotation.annotations.minimum.yMin = response.data[0].Consigne_Inf;
  //       chart.options.plugins.annotation.annotations.minimum.yMax = response.data[0].Consigne_Inf;
  //       chart.options.plugins.annotation.annotations.minimum.label.content = response.data[0].Consigne_Inf + "°C";
  //       chart.options.scales.y.max = response.data[0].Consigne_Sup + 0.1*response.data[0].Consigne_Sup;
  //       chart.options.scales.y.min = response.data[0].Consigne_Inf - 0.1*response.data[0].Consigne_Sup;

  //       // const annotation
  //       if (response.data[0].Valeur > chart.options.plugins.annotation.annotations.maximum.yMin){
  //         console.log("TROP CHAUD");
  //         document.getElementById('div-'+_chartName).style.backgroundColor = "rgba(254, 121, 104, 0.1)";
  //         // ALERT.getElementById('div-'+_chartName).style.backgroundColor = "rgba(254, 121, 104, 0.1)";
  //         toast.dismiss();
  //         toast('Température au delà de la consigne', {
  //           duration: 10000,
  //           position: 'top-center',
          
  //           // Styling
  //           style: {backgroundColor: "red", color:"white", fontSize:"1rem", fontWeight:"bold"},
  //           className: '',
          
  //           // Custom Icon
  //           icon: '🌡️'
  //         });
          
  //       } else if (response.data[0].Valeur < chart.options.plugins.annotation.annotations.minimum.yMin){
  //         console.log("TROP FROID")
  //         toast('Température en dessous de la consigne', {
  //           duration: 10000,
  //           position: 'top-center',
          
  //           // Styling
  //           style: {backgroundColor: "red", color:"white", fontSize:"1rem", fontWeight:"bold"},
  //           className: '',
          
  //           // Custom Icon
  //           icon: '🌡️'
  //         });
  //       }else {
  //         console.log("TIEDE")
  //         document.getElementById('div-'+_chartName).style.backgroundColor = "rgb(255, 255, 255)";
  //       }
        
    
  //       chart.update();
  //     // }
  //   });
  // }