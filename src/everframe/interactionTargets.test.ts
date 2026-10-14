import { describe,it,expect } from 'vitest';
import { buildInteractionContainer, annotationsEnabled } from './interactionTargets';

describe('logical interaction containers',()=>{
  it('uses source counts and logical indices when only a window is mounted',()=>{
    const source=Array.from({length:12},(_,i)=>`title-${i}`);
    const mounted=source.slice(5,8);
    expect(mounted.map(id=>buildInteractionContainer('originals','Originals',source.indexOf(id),source.length,'list')))
      .toEqual([5,6,7].map(index=>({testId:'originals',name:'Originals',role:'list',index,count:12})));
    source.reverse();
    expect(buildInteractionContainer('originals','Originals',source.indexOf('title-5'),source.length,'list').index).toBe(6);
  });
  it('uses actual tab count and tablist semantics',()=>{
    expect(buildInteractionContainer('nav','Navigation',1,5,'tablist')).toEqual({testId:'nav',name:'Navigation',role:'tablist',index:1,count:5});
  });
  it('only permits the off switch during development',()=>{
    expect(annotationsEnabled(true,'0')).toBe(false);
    expect(annotationsEnabled(false,'0')).toBe(true);
    expect(annotationsEnabled(true,undefined)).toBe(true);
  });
});
