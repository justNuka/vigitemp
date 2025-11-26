'use client';
// vigilog/page.tsx
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import VigilogSettings from "@/app/components/vigilog-settings";
import { usePathname } from "next/navigation";


export default function About() {
  const [rows, setRows] = useState([{ key: "", temperature: "", heureMesure: "" }]);
  const [isLoading, setLoading] = useState(false);
  const [ip, setIp] = useState<string>("");

  useEffect(() => {
    // const getLocalIP = async () => {
    //   const ip = await getServerSideProps();
    //   setIp(ip.props.localIP);
    // }
    // getLocalIP();
    // console.log(ip.);
  }, []);


  async function changeUserName() {
    setLoading(true);
    try {
      console.log(`http://${ip}:8000/getLogTagData`);
      const response = await axios.get(`http://${ip}:8000/DownloadLogTagData`);
      if (response.data.res) {
        const measuresResponse = await axios.get('/api/mesures/vigilog/' + response.data.id_recuperationMesure);
        const measures = measuresResponse.data;
        setRows((prevRows) => [
          ...prevRows,
          ...measures.map((element:any, index:any) => ({
            key: (prevRows.length + index + 1),
            temperature: element.valeur_mesure,
            heureMesure: element.heure_mesure,
          })),
        ]);
      } else {
        console.log("Pas de données");
      }
    } catch (error) {
      console.log("Erreur lors de la requête", error);
    } finally {
      setLoading(false);
    }
  }
  const pathname = usePathname();
  return (
      <main className="flex flex-col gap-5 w-[90vw] items-center p-24 pt-12 mx-auto h-[90vh]">
        <VigilogSettings/>
        <Button size="lg" id="btnRequestVigilog" color="primary" onPress={changeUserName} isLoading={isLoading}>
          Button
        </Button>
        <Table aria-label="Example table with dynamic content">
          <TableHeader columns={[{ key: "temperature", label: "TEMPERATURE" }, { key: "heureMesure", label: "HEURE" }]}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={rows} isLoading={isLoading} loadingContent={<Spinner label="Loading..." />}>
            {(item) => (
              <TableRow key={item.key}>
                {(columnKey) => <TableCell>{columnKey}</TableCell>}
                {/* {(columnKey) => <TableCell>1</TableCell>} */}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </main>
  );
}
