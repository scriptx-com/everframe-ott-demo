import { expect,it,vi } from 'vitest';
import { interactionPolicy, helpersEnabled, selectInteractionHook } from './interactionEvents';
it('allows values only for the actual search host and declares templates without content IDs',()=>{
 expect(interactionPolicy.valueTestIds).toEqual(['search-input']);
 expect(interactionPolicy.valueTestIds).not.toContain('password');expect(interactionPolicy.valueTestIds).not.toContain('masked');
 expect(interactionPolicy.urlRules).toContainEqual({origin:'nocturne://title',routes:['/:id']});
 expect(interactionPolicy.urlRules).toContainEqual({origin:'nocturne://play',routes:['/:id','/:id/:episode']});
 expect(interactionPolicy.launchArgumentKeys).toEqual([]);
});
it('helpers can be disabled in development while native IDs and automatic capture remain',()=>{
 expect(helpersEnabled(true,'0')).toBe(false);expect(helpersEnabled(false,'0')).toBe(true);expect(helpersEnabled(true,undefined)).toBe(true);
 const hook=vi.fn(); const off=selectInteractionHook({useEverframeInteraction:hook},false);
 const result=off({target:{testId:'search-input'},helperTypes:['text_edit']});result.ref({});result.textChanged('anything');
 expect(hook).not.toHaveBeenCalled();
});
it('older SDKs without the optional export remain usable',()=>{
 const old=selectInteractionHook({},true);const result=old();expect(()=>{result.ref({});result.textChanged('text');result.scrollSettled({axis:'x',direction:'forward'});}).not.toThrow();
 const hook=vi.fn();expect(selectInteractionHook({useEverframeInteraction:hook},true)).toBe(hook);
});
