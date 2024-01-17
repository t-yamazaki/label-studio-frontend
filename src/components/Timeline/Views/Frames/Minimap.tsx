import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import groupby from 'lodash.groupby';
import { Block, Elem } from '../../../../utils/bem';
import { isDefined } from '../../../../utils/utilities';
import { Lifespan, visualizeLifespans } from './Utils';
import './Minimap.styl';
import { TimelineContext } from '../../Context';
import { TimelineRegion } from '../../Types';

/**
 * label毎にLifespanをまとめる
 */
const _groupByLabel = (regions: TimelineRegion[], step: number) => {
  const grouped = groupby(regions, 'label');

  return Object.entries(grouped).map(([key, reg]) => {
    const { color, lifespans } = reg.reduce((acc, { color, sequence }) => {
      if (!acc.color) {
        acc.color = color;
      }
      acc.lifespans.push(...visualizeLifespans(sequence, step));
      return acc;
    }, { color: '', lifespans: [] } as { color: string, lifespans: Lifespan[] });

    return {
      id: key,
      color,
      lifespans,
    };
  });
};

export const Minimap: FC<any> = () => {
  const { regions, length } = useContext(TimelineContext);
  const root = useRef<HTMLDivElement>();
  const [step, setStep] = useState(0);

  const visualization = useMemo(() => {
    // group Lifespans by label
    return _groupByLabel(regions, step);

    // return regions.map(({ id, color, sequence }) => {
    //   return {
    //     id,
    //     color,
    //     lifespans: visualizeLifespans(sequence, step),
    //   };
    // });
  }, [step, regions]);

  useEffect(() => {
    if (isDefined(root.current) && length > 0) {
      setStep(root.current.clientWidth / length);
    }
  }, [length]);

  return (
    <Block ref={root} name="minimap">
      {visualization.map(({ id, color, lifespans }) => {
        return (
          <Elem key={id} name="region" style={{ '--color': color }}>
            {lifespans.map((connection, i) => {
              const isLast = i + 1 === lifespans.length;
              const left = connection.start * step;
              const width = (isLast && connection.enabled) ? '100%' : connection.width;

              return (
                <Elem key={`${id}${i}`} name="connection" style={{ left, width }}/>
              );
            })}
          </Elem>
        );
      })}
    </Block>
  );
};
