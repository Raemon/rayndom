'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, GridReadyEvent, GridApi } from 'ag-grid-community'
import type { Venue } from './WeddingVenuesPage'

ModuleRegistry.registerModules([AllCommunityModule])

const LinkRenderer = (props: ICellRendererParams & {urlField?: string, label?: string}) => {
  const url = props.urlField ? props.data?.[props.urlField] : props.value
  const label = props.label || props.value
  if (!url) return <span>{label}</span>
  return <a href={url} target="_blank" rel="noopener noreferrer" style={{color: '#0066cc', textDecoration: 'none'}}>{label}</a>
}

const NameRenderer = (props: ICellRendererParams) => {
  const {name, venueUrl} = props.data || {}
  if (!venueUrl) return <span style={{fontWeight: 500}}>{name}</span>
  return <a href={venueUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0066cc', textDecoration: 'none', fontWeight: 500}}>{name}</a>
}

const PricingRenderer = (props: ICellRendererParams) => {
  const {priceRange, pricingUrl} = props.data || {}
  if (!pricingUrl || pricingUrl === props.data?.venueUrl) return <span>{priceRange}</span>
  return <a href={pricingUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0066cc', textDecoration: 'none'}}>{priceRange}</a>
}

const CapacityRenderer = (props: ICellRendererParams) => {
  const {capacity, capacityUrl} = props.data || {}
  if (!capacityUrl || capacityUrl === props.data?.venueUrl) return <span>{capacity}</span>
  return <a href={capacityUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0066cc', textDecoration: 'none'}}>{capacity}</a>
}

const PhotoRenderer = (props: ICellRendererParams) => {
  const photoUrls: string[] = props.value || []
  if (!photoUrls.length) return <span style={{color: '#999'}}>-</span>
  return (
    <div style={{display: 'flex', gap: '4px', alignItems: 'center', height: '100%', padding: '4px 0', overflowX: 'auto'}}>
      {photoUrls.map((url, i) => (
        // <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{height: "100%"}}>
          <img key={i} src={url} alt="" style={{height: '100%', width: 'auto', maxHeight: 'unset', objectFit: 'contain'}} />
        // </a>
      ))}
    </div>
  )
}

const VenuesGrid = ({venues}: {venues: Venue[]}) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [quickFilter, setQuickFilter] = useState('')
  const [rowHeight, setRowHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('venuesGridRowHeight')
      return saved ? parseInt(saved, 10) : 60
    }
    return 60
  })
  useEffect(() => {
    localStorage.setItem('venuesGridRowHeight', String(rowHeight))
  }, [rowHeight])
  const columnDefs = useMemo<ColDef[]>(() => [
    {field: 'name', headerName: 'Name', cellRenderer: NameRenderer, filter: true, sortable: true, width: 200, pinned: 'left'},
    {field: 'priceRange', headerName: 'Pricing', cellRenderer: PricingRenderer, filter: true, sortable: true, width: 280},
    {field: 'lowestPrice', headerName: 'Low $', filter: 'agNumberColumnFilter', sortable: true, width: 90, valueFormatter: (p: {value: number | null}) => p.value != null ? `$${p.value.toLocaleString()}` : '-'},
    {field: 'highestPrice', headerName: 'High $', filter: 'agNumberColumnFilter', sortable: true, width: 90, valueFormatter: (p: {value: number | null}) => p.value != null ? `$${p.value.toLocaleString()}` : '-'},
    {field: 'capacity', headerName: 'Capacity', cellRenderer: CapacityRenderer, filter: true, sortable: true, width: 110},
    {field: 'region', headerName: 'Region', filter: true, sortable: true, width: 110},
    {field: 'type', headerName: 'Type', filter: true, sortable: true, width: 130},
    {field: 'address', headerName: 'Address', filter: true, sortable: true, width: 250},
    {field: 'distanceMiles', headerName: 'Distance (mi)', filter: 'agNumberColumnFilter', sortable: true, width: 110, valueFormatter: (p: {value: number | null}) => p.value != null ? `${p.value} mi` : '-'},
    {field: 'photoUrls', headerName: 'Photos', cellRenderer: PhotoRenderer, width: 500},
  ], [])
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), [])
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
  }, [])
  const onQuickFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilter(e.target.value)
    gridApi?.setGridOption('quickFilterText', e.target.value)
  }, [gridApi])
  const exportCsv = useCallback(() => {
    gridApi?.exportDataAsCsv({fileName: 'wedding-venues.csv'})
  }, [gridApi])
  const onRowHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10)
    setRowHeight(newHeight)
    gridApi?.resetRowHeights()
  }, [gridApi])
  return (
    <div>
      <div style={{marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center'}}>
        <input
          type="text"
          placeholder="Search venues..."
          value={quickFilter}
          onChange={onQuickFilterChange}
          style={{padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', width: '250px', fontSize: '14px'}}
        />
        <button onClick={exportCsv} style={{padding: '6px 12px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px'}}>
          Export CSV
        </button>
        <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666'}}>
          Row height: <input type="range" min="30" max="1000" value={rowHeight} onChange={onRowHeightChange} style={{width: '80px'}} /> {rowHeight}px
        </label>
        <span style={{color: '#666', fontSize: '13px'}}>Click column headers to sort/filter</span>
      </div>
      <div style={{height: 'calc(100vh - 180px)', width: '100%'}}>
        <AgGridReact
          rowData={venues}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={50}
          rowHeight={rowHeight}
          headerHeight={40}
          animateRows={true}
        />
      </div>
    </div>
  )
}

export default VenuesGrid
