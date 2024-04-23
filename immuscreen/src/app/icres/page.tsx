 "use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { StyledTab } from "../../common/utils"
import { client } from "../../common/utils"
import SearchIcon from "@mui/icons-material/Search"
import { Box, CircularProgress, Collapse, List, ListItemButton, ListItemText, Stack, ToggleButtonGroup, Typography } from "@mui/material"
import { Tabs } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { TextField, IconButton, InputAdornment } from "@mui/material"
import { FormControl, MenuItem } from "@mui/material"
import { ApolloError, useQuery } from "@apollo/client"

import Select, { SelectChangeEvent } from "@mui/material/Select";
import { ReadonlyURLSearchParams, useSearchParams} from "next/navigation"
import { GenomeBrowserView } from "../../common/gbview/genomebrowserview"
import { CcreAutoComplete } from "../../common/components/mainsearch/CcreAutocomplete"
import { DataTable } from "@weng-lab/psychscreen-ui-components"

import {IcresByRegion} from "./icresbyregion"
import { ATAC_UMAP_QUERY, EBI_ASSO_QUERY, ICRES_ACTIVE_EXPERIMENTS, ICRES_BYCT_ZSCORES_QUERY, ICRES_CT_ZSCORES_QUERY, ICRES_QUERY } from "./queries"
import InputLabel from "@mui/material/InputLabel";
import { stringToColour } from "../../common/utils";
import { AtacBarPlot } from "./atacbarplot"
import { cellTypeStaticInfo } from "../../common./../common/consts";
import { UmapPlot } from "../../common/components/umapplot";
import CellTypeTree from "../../common/components/cellTypeTree"
import { generateCellLineageTreeState, getCellColor, getCellDisplayName } from "../celllineage/utils"


//Need better text styling
import ToggleButton from '@mui/material/ToggleButton';
import { Experiment_Data } from "./types"
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import { ActiveCellTypesList, ActiveExperimentList } from "./utils"


export default function Icres() { 
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const [value, setValue] = useState(0)
  const router = useRouter()
  const [searchvalue, setSearchValue] = useState("")
  const [study, setStudy] = useState("Calderon")
  const [selectedPortal, setSelectedPortal] = useState<string>("Genomic Region");
  const [zscoreValue, setzscoreValue] = useState(0)
  const handleSelectedPortal = (event: SelectChangeEvent) => {
    setSelectedPortal(event.target.value);
  };
  const { loading: atacumaploading, data: atacumapdata } = useQuery(ATAC_UMAP_QUERY, {
    variables: {
      accession: searchParams.get("accession")
    },
    skip: !searchParams.get("accession"),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const {loading: icrezscoreloading, data: icrezscoredata} = useQuery(ICRES_CT_ZSCORES_QUERY,{
    variables: {
      accession: searchParams.get('accession'),
      study: [study]
    },
    skip: !searchParams.get('accession'),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const { loading: icrebyctzscoreloading, data: icrebyctzscoredata } = useQuery(ICRES_BYCT_ZSCORES_QUERY, {
    variables: {
      accession: searchParams.get('accession'),
      study: [study]
    },
    skip: !searchParams.get('accession'),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const { loading: aloading, data: adata, error: error_adata } = useQuery(ICRES_QUERY, {
    variables: {
      accession: searchParams.get('accession')
    },
    skip: !(searchParams && searchParams.get("accession")),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const { loading: loading_experiments, data: data_experiments, error: error_experiments }: { loading: boolean, data: { calderoncorcesAtacQuery: Experiment_Data[] }, error?: ApolloError } = useQuery(ICRES_ACTIVE_EXPERIMENTS, {
    variables: {
      accession: searchParams.get('accession') ? [searchParams.get('accession')] : []
    },
    skip: !searchParams.get('accession'),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  //Parse experiment info
  let activeExps: { [key: string]: Experiment_Data[] } = {}
  data_experiments?.calderoncorcesAtacQuery.forEach(exp => {
    //Cutoff for experiment activity set at 1.64
    if (exp.value > 1.64) {
      if (activeExps[exp.grouping]) {
        activeExps[exp.grouping] = [...activeExps[exp.grouping], exp]
      } else {
        activeExps[exp.grouping] = [exp]
      }
    }
  });


  let barplotdata = icrezscoredata && icrezscoredata.calderoncorcesAtacQuery.map(ic => {
    return {
      ...ic,
      color: getCellColor(ic.celltype),
      value: ic.value
    }
  })

  const [colorScheme, setcolorScheme] = useState('Zscore');
  const handleColorSchemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newScheme: string,
  ) => {
    setcolorScheme(newScheme);
  };
  let barplotbyctdata = icrebyctzscoredata && icrebyctzscoredata.calderoncorcesByCtAtacQuery.map(ic => {
    return {
      ...ic,
      color: getCellColor(ic.celltype),
      value: ic.value

    }
  })

  barplotdata = !icrezscoreloading && icrezscoredata && icrezscoredata.calderoncorcesAtacQuery.length > 0 && barplotdata.sort((a, b) => a.order - b.order);
  barplotbyctdata = !icrebyctzscoreloading && icrebyctzscoredata && icrebyctzscoredata.calderoncorcesByCtAtacQuery.length > 0 && barplotbyctdata.sort((a, b) => a.order - b.order);

  const { data: ebidata } = useQuery(EBI_ASSO_QUERY, {
    variables: {
      accession: searchParams.get('accession')
    },
    skip: !searchParams.get('accession'),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const handleChange = (_, newValue: number) => {
    setValue(newValue)
  }
  const handleZscoreChange = (_, newValue: number) => {
    setzscoreValue(newValue)
  }
  const handleSearchChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchValue(event.target.value)
  }
  function handleSubmit() {
    //if submitted with empty value, use default search
    if (searchvalue == "") {
      router.push(`/icres?chromosome=chr11&start=5205263&end=5381894`)
      return
    }
    const input = searchvalue.split(":")
    const chromosome = input[0]
    const coordinates = input[1].split("-")
    const start = coordinates[0]
    const end = coordinates[1]
    router.push(`/icres?chromosome=${chromosome}&start=${start}&end=${end}`)
}
return !searchParams.get('accession') && !searchParams.get('chromosome') ? (
  <main>
    <Grid2 container spacing={6} sx={{ mr: "auto", ml: "auto", mt: "3rem" }}>
      <Grid2 xs={6}>
        <Typography variant="h3">iCRE Portal</Typography>
        <br/>
        <FormControl variant="standard">
          <Select
            id="portal_Select"
            value={selectedPortal}
            // defaultValue={10}
            onChange={handleSelectedPortal}
          >
            <MenuItem value={"Genomic Region"}>Genomic Region</MenuItem>
            <MenuItem value={"iCREs"}>iCREs</MenuItem>
          </Select>
        </FormControl>
        <br/>
        <br/>
        {selectedPortal === "Genomic Region" ?
          <TextField
            variant="outlined"
            InputLabelProps={{ shrink: true, style: { color: "black" } }}
            label="Enter a genomic region in form chr:start-end."
            placeholder="chr11:5205263-5381894"
            value={searchvalue}
            onChange={handleSearchChange}
            onKeyDown={(event) => {
              if (event.code === "Enter") {
                handleSubmit()
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ color: "black" }}>
                  <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()} sx={{ color: "black" }}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              style: { color: "black" },
            }}
            sx={{ mr: "1em", ml: "1em", fieldset: { borderColor: "black" } }}
          />
          : <CcreAutoComplete textColor={"black"} assembly={"GRCh38"} />
        }
      </Grid2>
    </Grid2>
  </main>) : searchParams.get('chromosome') ? (
    <IcresByRegion />
  ) : (
  <main>
    <Grid2 container sx={{ maxWidth: "80%", mr: "auto", ml: "auto", mt: "3rem" }}>
      <Grid2 container sx={{ ml: "0.5em", mt: "4rem", mb: "2rem" }}>
        <Grid2 xs={12} lg={12}>
          {searchParams.get("accession") && <Typography variant="h4">Accession Details: {searchParams.get("accession")}</Typography>}
        </Grid2>
        <Grid2 xs={12} lg={12}>
          <Tabs aria-label="icres_tabs" value={value} onChange={handleChange}>
            <StyledTab label="Genome Browser" />
            <StyledTab label="Calderon Zscore UMAP" />
            <StyledTab label="EBI Associations" />
            <StyledTab label="Cell type specific zscores" />
            <StyledTab label="View Activity in Cell Lineage" />
          </Tabs>
        </Grid2>
      </Grid2>

      {value === 0 && adata &&
        <Grid2 xs={12} lg={12}>
          <GenomeBrowserView
            accession={
              {
                name: adata.iCREQuery[0].accession,
                start: adata.iCREQuery[0].coordinates.start,
                end: adata.iCREQuery[0].coordinates.end,
              }
            }
            assembly={"GRCh38"}
            coordinates={{ start: adata.iCREQuery[0].coordinates.start, end: adata.iCREQuery[0].coordinates.end, chromosome: adata.iCREQuery[0].coordinates.chromosome }}
            defaultcelltypes={adata.iCREQuery[0].celltypes}
          />
        </Grid2>
      }
      {value === 1 &&  searchParams.get("accession") && !atacumaploading && atacumapdata && atacumapdata.calderonAtacUmapQuery.length>0 &&
        
          <Grid2 xs={12} lg={12}>
              Color Scheme:
              <br/><br/>
            <ToggleButtonGroup
              color="primary"
              value={colorScheme}
              exclusive
              
              onChange={handleColorSchemeChange}
              aria-label="Platform"
            >
            <ToggleButton value="ZScore">Zscore</ToggleButton>
            <ToggleButton value="celltype">CellType Cluster</ToggleButton>      
            </ToggleButtonGroup>
            <br/>
            <br/>
            <UmapPlot colorScheme={colorScheme} data={atacumapdata.calderonAtacUmapQuery} plottitle={"ZScore"}/>
            </Grid2>
        

      }
      {value === 2 && ebidata &&
        <Grid2 container>
          <Grid2 xs={12} lg={12}>
            <DataTable
              columns={[
                {
                  header: "Chromosome",
                  value: (row) => row.chromosome,
                },
                {
                  header: "Position",
                  value: (row) => row.position,
                },
                {
                  header: "Strongest snp risk allele",
                  value: (row) => row.strongest_snp_risk_allele,
                },
                {
                  header: "Risk Allele Frequency",
                  value: (row) => row.risk_allele_frequency,

                },
                {
                  header: "P-Value",
                  value: (row) => row.p_value && row.p_value || 0,
                },
                {
                  header: "Study",
                  value: (row) => row.study,
                },
                {
                  header: "Region",
                  value: (row) => row.region,
                },
                {
                  header: "Immu screen trait",
                  value: (row) => row.immu_screen_trait
                },
                {
                  header: "mapped_trait",
                  value: (row) => row.mapped_trait
                },
                {
                  header: "Pubmed Id",
                  value: (row) => row.pubmedid

                }

              ]}
              tableTitle={`EBI Associations for ${searchParams.get('accession')}:`}
              rows={ebidata.ebiAssociationsQuery || []}


              itemsPerPage={10}
            />
          </Grid2>
        </Grid2>
      }
      {value === 3 &&
        <Grid2 xs={12} lg={12}>
          <FormControl>
            <InputLabel id="select-study-label">Study</InputLabel>
            <Select
              labelId="select-study-label"
              id="select-study"
              value={study}
              label="Study"
              onChange={(event: SelectChangeEvent) => {
                setStudy(event.target.value as string)
                if (event.target.value === "Corces" && zscoreValue === 1) {
                  setzscoreValue(0)
                }
              }}
            >
              <MenuItem value={'Calderon'}>Calderon</MenuItem>
              <MenuItem value={'Corces'}>Corces</MenuItem>
            </Select>
          </FormControl>
          <br />
          <br />
        </Grid2>}
      {value === 3 &&
        <Grid2 xs={12} lg={12}>
          <Tabs aria-label="icres_tabs" value={zscoreValue} onChange={handleZscoreChange}>
            <StyledTab label="By Experiment" />
            {study === 'Calderon' && <StyledTab label="By Celltype" />}
          </Tabs>
        </Grid2>
      }
      {value === 3 && zscoreValue === 0 && icrezscoredata && icrezscoredata.calderoncorcesAtacQuery.length > 0 && barplotdata &&
        <>
          <Grid2 container>
            {barplotdata.filter(b => b.grouping === 'Lymphoid') && <Grid2 xs={6} lg={6}>
              <AtacBarPlot study={study} plottitle="Lymphoid" barplotdata={barplotdata.filter(b => b.grouping === 'Lymphoid')} />
            </Grid2>}
            <Grid2 xs={1} lg={1}></Grid2>
            {barplotdata.filter(b => b.grouping === 'Myeloid') && <Grid2 xs={5} lg={5}>
              <AtacBarPlot study={study} plottitle="Myeloid" barplotdata={barplotdata.filter(b => b.grouping === 'Myeloid')} />
            </Grid2>}
          </Grid2>
          {study === 'Corces' &&
            <Grid2 container>
              {barplotdata.filter(b => b.grouping === 'Leukemic') && <Grid2 xs={6} lg={6}>
                <AtacBarPlot study={study} plottitle="Leukemic" barplotdata={barplotdata.filter(b => b.grouping === 'Leukemic')} />
              </Grid2>}
              <Grid2 xs={1} lg={1}></Grid2>
              {barplotdata.filter(b => b.grouping === 'Progenitors') && <Grid2 xs={5} lg={5}>
                <AtacBarPlot study={study} plottitle="Progenitors" barplotdata={barplotdata.filter(b => b.grouping === 'Progenitors')} />
              </Grid2>}
            </Grid2>
          }
        </>
      }
      {
        value === 3 && zscoreValue === 1 && icrebyctzscoredata && icrebyctzscoredata.calderoncorcesByCtAtacQuery.length > 0 && barplotbyctdata &&
        <Grid2 container>
          <Grid2 xs={12} lg={12}>
            <AtacBarPlot study={study} barplotdata={barplotbyctdata} byct />
          </Grid2>
        </Grid2>
      }
      {value === 4 &&
        (aloading ?
          <CircularProgress />
          :
            <Stack rowGap={2}>
              <Stack direction={"row"}>
                {
                aloading ? <CircularProgress />
                : error_adata ? <Typography>Something went wrong fetching activity in cell types</Typography>
                : <Box maxWidth={500}><ActiveCellTypesList celltypes={adata?.iCREQuery[0].celltypes} /></Box>
              }
              {
                loading_experiments ? <CircularProgress />
                : error_experiments ? <Typography>Something went wrong fetching activity in individual experiments</Typography>
                : <Box maxWidth={500}><ActiveExperimentList activeExps={activeExps} /></Box>
              }
              </Stack>
              <CellTypeTree
                width={830}
                height={1100}
                orientation="vertical"
                cellTypeState={generateCellLineageTreeState(adata?.iCREQuery[0].celltypes || [], false)}
              />
            </Stack>
        )
      }
    </Grid2>
  </main>
)
}
