import React, {
  RefObject,
  useEffect,
  useMemo,
  useState,
} from "react";
import { experimentInfo } from "../consts";
import TitledImportanceTrack from "./titledimportancetrack";
import { BigBedData } from "bigwig-reader";
import ChromBPNetAtacModal from "./chrombpnetatacmodal"
import { CalderonBigWigTracksMetadata, CalderonCellTypesMetadata } from "./consts";
import { CellDisplayName, CellQueryValue } from "../../app/celllineage/types";
import { getCellColor, getCellDisplayName } from "../../app/celllineage/utils";
export type GenomicRange = {
  chromosome?: string;
  start: number;
  end: number;
};

type ChromBPNetBulkAtacTrackProps = {
  trait?: string;
  domain: GenomicRange;
  onHeightChanged?: (i: number) => void;
  svgRef?: RefObject<SVGSVGElement>;
  onSettingsClicked?: () => void;
  onImportantRegionsLoaded?: (regions: BigBedData[]) => void;
  defaultTrackset?: string;
  defaultcelltypes?: string[]
};

const TRACKSETS = (r) => {
  return r && r.length > 0 ? r.map(t => {
    return [t.description, `https://downloads.wenglab.org/chrombpnetbulkatac/${t.name}.bigWig`]
  }) : [

    [
      "Monocytes, stimulated with 1 µg/ml LPS for 24 hours, in donor 1010",
      "https://downloads.wenglab.org/chrombpnetbulkatac/1010-Monocytes-S.bigWig",
    ],
    [
      "Naïve T regulatory cells, stimulated with 1:1 CD3/CD28 coated beads and 300 U/ml IL-2 for 24 hours, in donor 1010",
      "https://downloads.wenglab.org/chrombpnetbulkatac/1010-Naive_Tregs-S.bigWig",
    ],
    [
      "Plasmablasts in donor 1010",
      "https://downloads.wenglab.org/chrombpnetbulkatac/1010-Plasmablasts-U.bigWig",
    ],
    [
      "Effector CD4 T cell, stimulated with 1:1 CD3/CD28 coated beads and 50 U/ml IL-2 for 24 hours, in donor 1011",
      "https://downloads.wenglab.org/chrombpnetbulkatac/1011-Naive_Teffs-S.bigWig",
    ]

  ]
};


const ChromBPNetAtacTracks: React.FC<ChromBPNetBulkAtacTrackProps> = ({
  domain,
  onHeightChanged,
  onSettingsClicked,
  onImportantRegionsLoaded,
  defaultTrackset,
  defaultcelltypes
}) => {

  console.log(defaultcelltypes)
  //Given a query value I want the corresponding list of studies
  const r = defaultcelltypes && CalderonBigWigTracksMetadata.filter(c => defaultcelltypes.includes(c.celltype_name))
  console.log(r)


  const chrombpnetColors: {[key:string]: string} = {}
  
  // const defaultTracks: [string, string][] = defaultcelltypes?.map((cell: CellQueryValue) => {
  //   chrombpnetColors[getCellDisplayName(cell, true, true)] = getCellColor(cell)
  //   return [getCellDisplayName(cell, true, true), `https://downloads.wenglab.org/${cell}.bigWig`]
  // }) || []

  const defaultTracks: [string, string][] = []

  if (defaultcelltypes) for (let cell of defaultcelltypes) {
    //Currently this is slightly broken in that it includes all monocyte experiments when "Mono" is cell since Mono is substring of all Monocyte S and U experiments, need to fix
    const experiments = Object.entries(experimentInfo).filter(([experiment, info]) => experiment.includes(cell))
    experiments.forEach(exp => {
      chrombpnetColors[exp[1].description] = getCellColor(cell as CellQueryValue)
      defaultTracks.push([exp[1].description, `https://downloads.wenglab.org/${exp[0]}.bigWig`])
    })
  }

  defaultTracks.sort()

  // manage displayed tracks, compute height, and pass height back to parent
  const [displayedTracks, setDisplayedTracks] = useState<[string, string][]>(defaultTracks);
  const height = useMemo(
    () =>
      130 +
      (displayedTracks.length * 130) - 130,
    [displayedTracks, domain]
  );

  useEffect(() => {
    onHeightChanged && onHeightChanged(height);
  }, [onHeightChanged, height]);

  // manage settings modal
  const [settingsMousedOver, setSettingsMousedOver] = useState(false);
  const [settingsModalShown, setSettingsModalShown] = useState(false);



  return (
    <>
      <ChromBPNetAtacModal
        open={settingsModalShown}
        onCancel={() => setSettingsModalShown(false)}
        onAccept={(x) => {
          setDisplayedTracks(x);
          setSettingsModalShown(false);
        }}
        initialSelection={displayedTracks}
      />
      <g className="encode-fetal-brain">
        <rect y={10} height={55} fill="none" width={1400} />
      </g>
      {displayedTracks
        .map((x, i) => (
          <TitledImportanceTrack
            key={`${i}_${domain.start}`}
            transform={`translate(0,${130 * i})`}
            title={x[0]}
            height={130}
            width={1400}
            imputedSignalURL={`${x[1]}`}
            signalURL={`${x[1].replace('bigWig', 'profile_scores.bw')}`}
            domain={domain}
            neutralRegions={[]}
            color={chrombpnetColors[x[0]]}
          />
        ))}
      {settingsMousedOver && (
        <rect
          width={1400}
          height={height}
          transform="translate(0,-0)"
          fill="#ab3f00"
          fillOpacity={0.1}
        />
      )}
      <rect
        transform="translate(0,0)"
        height={height}
        width={40}
        fill="#ffffff"
      />
      <rect
        height={height}
        width={15}
        fill="#ab3f00"
        stroke="#000000"
        fillOpacity={settingsMousedOver ? 1 : 0.6}
        onMouseOver={() => setSettingsMousedOver(true)}
        onMouseOut={() => setSettingsMousedOver(false)}
        strokeWidth={1}
        transform="translate(20,0)"
        onClick={() => {
          onSettingsClicked && onSettingsClicked();
          setSettingsModalShown(true);
        }}
      />
      <text
        transform={`rotate(270) translate(-${height / 2},12)`}
        textAnchor="middle"
        fill="#ab3f00"
      >
        ChromBPNet ATAC Tracks
      </text>
    </>
  );
};
export default ChromBPNetAtacTracks;