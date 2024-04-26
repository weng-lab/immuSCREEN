"use client"
import * as React from "react"
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem } from "@mui/material"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import MenuIcon from "@mui/icons-material/Menu"
import { ThemeProvider } from "@mui/material/styles"
import Link from "next/link"
import nextConfig from "../../../next.config"
import { defaultTheme } from "../lib/themes"
import Image from 'next/image'

const pageLinks = [
  {
    pageName: "About",
    link: "/about"    
  },
  {
    pageName: "Portals",
    link: "/portal",
    dropdownID: "1",
    subPages: [
      { pageName: "Gene", link: "/gene" },
      { pageName: "SNP", link: "/snp" },
      { pageName: "iCREs", link: "/icres" },
      { pageName: "Cell Lineage", link: "/celllineage"},
      { pageName: "Phenotype", link: "/phenotype"}
    ],
  }
]

/**
 * @todo: Hamburger Menu, need to align optically without setting the margin to zero - it messes up interacting with the button
 */

const HomeAppBar = () => {
  const [open, setState] = React.useState<boolean>(false)
  // Hamburger Menu, deals with setting its position
  const [anchorElNav_Hamburger, setAnchorElNav_Hamburger] = React.useState<null | HTMLElement>(null)

  // Hover dropdowns, deals with setting its position
  const [anchorElNav_Dropdown0, setAnchorElNav_Dropdown0] = React.useState<null | HTMLElement>(null)
  const [anchorElNav_Dropdown1, setAnchorElNav_Dropdown1] = React.useState<null | HTMLElement>(null)

  // Open Hamburger
  const handleOpenNavMenu_Hamburger = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav_Hamburger(event.currentTarget)
  }

  // Open Dropdown
  const handleOpenNavMenu_Dropdown = (event: React.MouseEvent<HTMLElement>, dropdownID: string) => {
    if (dropdownID == "0") {
      setAnchorElNav_Dropdown0(event.currentTarget)
    } else if (dropdownID == "1") {
      setAnchorElNav_Dropdown1(event.currentTarget)
    }
  }

  // Close Hamburger
  const handleCloseNavMenu_Hamburger = () => {
    setAnchorElNav_Hamburger(null)
  }

  // Close Dropdown
  const handleCloseNavMenu_Dropdown = (dropdownID: string) => {
    if (dropdownID == "0") {
      setAnchorElNav_Dropdown0(null)
    } else if (dropdownID == "1") {
      setAnchorElNav_Dropdown1(null)
    }
  }

  // const toggleDrawer = (open) => (event) => {
  //   if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
  //     return
  //   }
  //   setState(open)
  // }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ justifyContent: "center"}}>           
            <Box
              component='a'
              href="/"
              sx={{
                mr: 2,
                ml: 1,
                flexGrow: 0,
                display: { xs: "none", md: "flex" },
              }}
            >
              <Image
                src="/igSCREEN_red.png"
                width={100}
                height={50}
                alt="igSCREEN logo"
              />
            </Box>
            <Box sx={{ flexGrow: 0, display: { xs: "inline", md: "none" } }}>
              {/* Hamburger Menu, open on click */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu_Hamburger}
                color="inherit"
                sx={{ pl: 0 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav_Hamburger}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav_Hamburger)}
                onClose={handleCloseNavMenu_Hamburger}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                <MenuItem onClick={handleCloseNavMenu_Hamburger}>
                  <Typography component="a" href={`${nextConfig.basePath}`} textAlign="center">
                    Home
                  </Typography>
                </MenuItem>
                {pageLinks.map((page) => (
                  <MenuItem key={page.pageName} onClick={handleCloseNavMenu_Hamburger}>
                    {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                    <Link href={page.link}>
                      <Typography textAlign="center" textTransform="none">{page.pageName}</Typography>
                    </Link>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box
              component='a'
              href="/"
              sx={{
                mr: 2,
                flexGrow: 0,
                display: { xs: "flex", md: "none" },
              }}
            >
              <Image
                src="/igSCREEN_red.png"
                width={116}
                height={50}
                alt="igSCREEN logo"
              />
            </Box>
            {/* Main navigation items for desktop */}
            <Box sx={{ flexGrow: 0, flexShrink: 1, display: { xs: "none", md: "flex" } }}>
              {pageLinks.map((page) => (
                <Box key={page.pageName}>
                  <Button
                    sx={{
                      my: 2,
                      color: "white",
                      display: "flex",
                      "& .MuiButton-endIcon": { ml: 0 },
                    }}
                    endIcon={page.subPages && <ArrowDropDownIcon />}
                    onMouseEnter={page.subPages ? (event) => handleOpenNavMenu_Dropdown(event, page.dropdownID) : undefined}
                  >
                    {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                    <Link href={page.link}>{page.pageName}</Link>
                  </Button>
                  {/* Hover dropdowns, open on hover. Create new instance for each menu item */}
                  {page.subPages && (
                    <Menu
                      id={`${page.pageName}-dropdown-appbar`}
                      // This logic would need to change when adding another dropdown
                      anchorEl={page.dropdownID == "0" ? anchorElNav_Dropdown0 : anchorElNav_Dropdown1}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      open={page.dropdownID == "0" ? Boolean(anchorElNav_Dropdown0) : Boolean(anchorElNav_Dropdown1)}
                      onClose={() => handleCloseNavMenu_Dropdown(page.dropdownID)}
                      //These are to prevent focus ring from showing up in some browsers, but doesn't work completely
                      MenuListProps={{ autoFocusItem: false, autoFocus: false }}
                      sx={{
                        display: { xs: "block" },
                      }}
                    >
                      {page.subPages &&
                        page.subPages.map((subPage) => (
                          <MenuItem key={subPage.pageName} onClick={() => handleCloseNavMenu_Dropdown(page.dropdownID)}>
                            {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                            <Link href={subPage.link}>
                              <Typography textAlign="center">{subPage.pageName}</Typography>
                            </Link>
                          </MenuItem>
                        ))}
                    </Menu>
                  )}
                </Box>
              ))}
            </Box>
           
          </Toolbar>
        </Container>
      </AppBar>
      </Box>
    </ThemeProvider>
  )
}
export default HomeAppBar
