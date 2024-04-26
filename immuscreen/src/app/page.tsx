//Home Page

"use client"
import { FormControl, MenuItem, Typography } from "@mui/material"
import React, { useState } from "react"

import Select, { SelectChangeEvent } from "@mui/material/Select";
// Grid v2 isn't declared stable yet, but using it now as it's what MUI is currently developing out
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { GeneAutoComplete } from "../common/components/mainsearch/GeneAutocomplete";
import { SnpAutoComplete } from "../common/components/mainsearch/SnpAutocomplete";
import { CcreAutoComplete } from "../common/components/mainsearch/CcreAutocomplete";
import Image from 'next/image'
import MainSearch from "../common/components/mainsearch/MainSearch";
import GenomicRegion from "../common/components/mainsearch/genomicregion";

const Home = () => {
  const [selectedPortal, setSelectedPortal] = useState<string>("Genes");
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedPortal(event.target.value);
  };

  return (
    <main>
      {/* May need to rethink where these margins are set. Which element should be setting content width? */}
      <Grid2 container spacing={6} sx={{ mr: "auto", ml: "auto", mt: "2rem" }}>
        <Grid2 xs={12}>
          <Image
            src="/igSCREEN_red_light.png"
            width={400}
            height={172}
            alt="igSCREEN logo"
          />
        </Grid2>
        <Grid2 xs={12}>
          <Typography variant="h6">Search <em>immune</em> Candidate cis-Regulatory Elements by ENCODE</Typography>
          <br />
          <FormControl variant="standard">
            <Select
              id="portal-select"
              value={selectedPortal}
              onChange={handleChange}
            >
              <MenuItem value={"Genes"}>Genes</MenuItem>
              <MenuItem value={"iCREs"}>iCREs</MenuItem>
              <MenuItem value={"Genomic Region"}>Genomic Region</MenuItem>
              <MenuItem value={"SNPs"}>SNPs</MenuItem>
            </Select>
          </FormControl>
          <br />
          <br />
          {
            selectedPortal === "Genes" ? <GeneAutoComplete textColor={"black"} assembly={"GRCh38"} />
              : selectedPortal === "SNPs" ? <SnpAutoComplete textColor={"black"} assembly={"GRCh38"} />
                : selectedPortal === "Genomic Region" ? <GenomicRegion assembly="GRCh38" />
                  : <CcreAutoComplete textColor={"black"} assembly={"GRCh38"} />
          }
        </Grid2>
      </Grid2>
    </main>
  )
}

export default Home;