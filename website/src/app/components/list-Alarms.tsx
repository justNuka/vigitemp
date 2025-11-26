'use client'
import React, {SVGProps, useEffect, useState} from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Selection,
  ChipProps,
  SortDescriptor,
} from "@heroui/react";
import SearchFilters from "./filter/searchFilters";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const PlusIcon = ({size = 24, width, height, ...props}: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );
};

export const VerticalDotsIcon = ({size = 24, width, height, ...props}: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SearchIcon = (props: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

export const ChevronDownIcon = ({strokeWidth = 1.5, ...otherProps}: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...otherProps}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export const columns = [
  {name: "ID", uid: "id", sortable: true},
  {name: "NOM", uid: "nom", sortable: true},
  {name: "DESCRIPTION", uid: "description", sortable: true},
  {name: "TYPE", uid: "type", sortable: true},
  {name: "STATUS", uid: "status", sortable: true},
  {name: "DATE DERNIERE ALARME", uid: "date", sortable: true},
];

// export const statusdOptions = [
//   {name: "Surveillance", uid: "S"},
//   {name: "Desactivé", uid: "D"},
// ];
interface Alarme {
    NomLieu: string;
    description: string,
    date: string,
    type:string,
    status:string,
    // Add other properties if needed
}



const statusColorMap: Record<string, ChipProps["color"]> = {
  "en cours": "danger",
  "attente acquittement": "warning",
};
const statusNameMap: Record<string, string> = {
  "en cours": "Alarme en cours",
  "attente acquittement": "Attente d'acquittement",
};
const typeColorMap: Record<string, ChipProps["color"]> = {
  "metrologique": "default",
  "technique": "default",
};
const typeNameMap: Record<string, string> = {
  "metrologique": "Alarme métrologique",
  "technique": "Alarme technique",
};
const columnsSize: Record<string, number> = {
  "nom": 100,
  "description": 10,
  "type": 10,
  "status": 10,
  "date": 10,
};

const INITIAL_VISIBLE_COLUMNS = ["nom", "description", "type", "status", "date"];

export default function ListAlarms({ SideBar, data } : {
    SideBar?:boolean
    data?:Alarme[]
}) {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
//   const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const [lieux, setLieux] = useState<Alarme[]>([]);

  type type_Lieu = (typeof lieux)[0];

    useEffect(() => {
        // axios.get('/api/lieux', {
        //     params: {
        //         enSurveillance: 1
        //     }
        // })
        // .then(response => {
        //     if (Array.isArray(response.data)) {
        //         // console.log(response.data);
        //         setLieux(response.data);
        //         // setLieux([response.data[0]]);
        //     } else {
        //         console.error("Unexpected data format:", response.data);
        //     }
        // })
        // .catch(error => {
        //     console.error("Error fetching data:", error);
        // });
        if (Array.isArray(data)) setLieux(data);
    }, [])  

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...lieux];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) => {
        console.log("filterValue: " + filterValue);
        console.log(user.NomLieu + " == " + filterValue.toLowerCase() + user.NomLieu.toLowerCase().includes(filterValue.toLowerCase()));
        return user.NomLieu.toLowerCase().includes(filterValue.toLowerCase())
      });
    }
    // if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
    //   filteredUsers = filteredUsers.filter((user) =>
    //     Array.from(statusFilter).includes(user.Lieu_Etat),
    //   );
    // }
    // console.log(filteredUsers);
    return filteredUsers;
  }, [lieux, filterValue, statusFilter]);

//   const pages = Math.ceil(filteredItems.length / rowsPerPage);

  // const items = React.useMemo(() => {
  //   const start = (page - 1) * rowsPerPage;
  //   const end = start + rowsPerPage;

  //   return filteredItems.slice(start, end);
  // }, [page, filteredItems, rowsPerPage]);

  // const sortedItems = React.useMemo(() => {
  //   return filteredItems.sort((a: type_Lieu, b: type_Lieu) => {
  //     const first = a[sortDescriptor.column as keyof type_Lieu] as unknown;
  //     const second = b[sortDescriptor.column as keyof type_Lieu] as unknown;
  //     const cmp = first < second ? -1 : first > second ? 1 : 0;

  //     return sortDescriptor.direction === "descending" ? -cmp : cmp;
  //   });
  // }, [sortDescriptor, filteredItems]);

  const renderCell = React.useCallback((lieu: Alarme, columnKey: React.Key) => {

    switch (columnKey) {
      case "nom":
        return (
            <div>
                {lieu.NomLieu}
            </div>
        );
      case "description":
        return (
          <div>
            {lieu.description}
          </div>
        );
      case "type":
        console.log(lieu.type)
        return (
          <Chip className="capitalize" color={typeColorMap[lieu.type]} size="sm" variant="flat">
          {typeNameMap[lieu.type]}
        </Chip>
        );
      case "status":
        // console.log(lieu.status)
        return (
          <Chip className="capitalize" color={statusColorMap[lieu.status]} size="sm" variant="flat">
          {statusNameMap[lieu.status]}
        </Chip>
        );
      case "date":
        return (
          <div>
            {lieu.date}
          </div>
        );
    //   case "actions":
    //     return (
    //       <div className="relative flex justify-end items-center gap-2">
    //         <Dropdown>
    //           <DropdownTrigger>
    //             <Button isIconOnly size="sm" variant="light">
    //               <VerticalDotsIcon className="text-default-300" />
    //             </Button>
    //           </DropdownTrigger>
    //           <DropdownMenu>
    //             <DropdownItem key="view">View</DropdownItem>
    //             <DropdownItem key="edit">Edit</DropdownItem>
    //             <DropdownItem key="delete">Delete</DropdownItem>
    //           </DropdownMenu>
    //         </Dropdown>
    //       </div>
    //     );
      default:
        return "no data";
    }
  }, []);

//   const onNextPage = React.useCallback(() => {
//     if (page < pages) {
//       setPage(page + 1);
//     }
//   }, [page, pages]);

//   const onPreviousPage = React.useCallback(() => {
//     if (page > 1) {
//       setPage(page - 1);
//     }
//   }, [page]);

//   const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
//     setRowsPerPage(Number(e.target.value));
//     setPage(1);
//   }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    console.log(value)
    if (value) {
      setFilterValue(value);
      // setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    // setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      // <div className="flex flex-col gap-4">
      // <div className="flex justify-between gap-3">
      //   <div className="flex gap-3">
      //     <Dropdown>
      //       <DropdownTrigger className="hidden sm:flex">
      //         <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat"
      //           className='transition-colors-opacity data-[hover=true]:bg-gray-50 group-data-[focus=true]:bg-white bg-white border-[#d6d6d6] border-1'>
      //           État
      //         </Button>
      //       </DropdownTrigger>
      //       <DropdownMenu
      //         disallowEmptySelection
      //         aria-label="Table Columns"
      //         closeOnSelect={false}
      //         selectedKeys={statusFilter}
      //         selectionMode="multiple"
      //         onSelectionChange={setStatusFilter}
      //       >
      //         {statusOptions.map((status) => (
      //           <DropdownItem key={status.uid} className="capitalize">
      //             {capitalize(status.name)}
      //           </DropdownItem>
      //         ))}
      //       </DropdownMenu>
      //     </Dropdown>
      //     {/* <Button color="primary" endContent={<PlusIcon />}>
      //       Ajouter un lieu
      //     </Button> */}
      //   </div>
      //   <Input
      //     isClearable
      //     // className="w-full sm:max-w-[44%]"
      //     placeholder="Recherche"
      //     startContent={<SearchIcon />}
      //     value={filterValue}
      //     onClear={() => onClear()}
      //     onValueChange={onSearchChange}
      //     classNames={{
      //       base:'w-80',
      //       inputWrapper:'transition-colors-opacity data-[hover=true]:bg-gray-50 group-data-[focus=true]:bg-white bg-white border-[#d6d6d6] border-1',
      //     }}
      //   />
      // </div>
      // </div>
      (<SearchFilters onSearchClear={() => onClear()} onSearchValueChange={onSearchChange}/>)
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    // onRowsPerPageChange,
    lieux.length,
    hasSearchFilter,
  ]);

//   const bottomContent = React.useMemo(() => {
//     return (
//       <div className="py-2 px-2 flex justify-center items-center">
//         <Pagination
//           isCompact
//           showControls
//           showShadow
//           color="primary"
//           page={page}
//           total={pages}
//           onChange={setPage}
//         />
//       </div>
//     );
//   }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <div className='h-full w-full flex'>
        <Table
        isHeaderSticky
        layout="auto"
        selectionBehavior="replace"
        aria-label="Example table with custom cells, pagination and sorting"
        // bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
            wrapper: "w-full h-full ", // Ensures the table is scrollable if needed
            table: "",
            base: "h-full",
            // emptyWrapper: "table-fixed h-full",
            // loadingWrapper: "table-fixed h-full",
            // sortIcon: "table-fixed h-full",
            tbody: "table-fixed h-full",
            // td: "table-fixed h-full",
            // tfoot: "table-fixed h-full",
            // th: "table-fixed h-full",
            // thead: "table-fixed h-full",
            // tr: "table-fixed h-full"
        }}
        selectedKeys={selectedKeys}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
        >
        <TableHeader columns={headerColumns}>
            {(column) => (
            <TableColumn
                // maxWidth={300}

                width={columnsSize[column.name]}
                maxWidth={10000}
                key={column.uid}
                align="start"
                allowsSorting={column.sortable}
            >
                {column.name}
            </TableColumn>
            )}
        </TableHeader>
        <TableBody emptyContent={"Pas de lieux trouvés"} items={filteredItems} loadingContent={"Chargement..."}>
            {(item) => (
            <TableRow key={item.NomLieu}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
            )}
        </TableBody>
        </Table>
    
    </div>
  );
}



// 'use client'
// import React, { useEffect, useState } from "react";
// import MonitoringGraph from "./monitoring-graph";
// import axios from "axios";
// import SearchFilters from "./searchFilters";
// import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";



// export default function ListLieux({ SideBar } : {
//     SideBar?:boolean
// }) {

//     return (
//         <div className={`${(SideBar)?'ml-[288px]':''}`}>
//             <Table aria-label="Example static collection table"
//                 classNames={{
//                     base: "h-full",
//                     emptyWrapper: "h-full",
//                     loadingWrapper: "h-full",
//                     sortIcon: "h-full",
//                     table: "h-full",
//                     wrapper: "h-full",
//                 }}
//             >
//                 <TableHeader>
//                     <TableColumn>NAME</TableColumn>
//                     <TableColumn>ROLE</TableColumn>
//                     <TableColumn>STATUS</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                     <TableRow key="1">
//                     <TableCell>Tony Reichert</TableCell>
//                     <TableCell>CEO</TableCell>
//                     <TableCell>Active</TableCell>
//                     </TableRow>
//                     <TableRow key="2">
//                     <TableCell>Zoey Lang</TableCell>
//                     <TableCell>Technical Lead</TableCell>
//                     <TableCell>Paused</TableCell>
//                     </TableRow>
//                     <TableRow key="3">
//                     <TableCell>Jane Fisher</TableCell>
//                     <TableCell>Senior Developer</TableCell>
//                     <TableCell>Active</TableCell>
//                     </TableRow>
//                     <TableRow key="4">
//                     <TableCell>William Howard</TableCell>
//                     <TableCell>Community Manager</TableCell>
//                     <TableCell>Vacation</TableCell>
//                     </TableRow>
//                 </TableBody>
//                 </Table>
//         </div>
        
//     );
// }
