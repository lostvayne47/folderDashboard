package com.demo.folderDashboard.ux.views;

import javax.baja.naming.BOrd;
import javax.baja.nre.annotations.AgentOn;
import javax.baja.nre.annotations.Generated;
import javax.baja.nre.annotations.NiagaraSingleton;
import javax.baja.nre.annotations.NiagaraType;
import javax.baja.sys.BSingleton;
import javax.baja.sys.Context;
import javax.baja.sys.Sys;
import javax.baja.sys.Type;
import javax.baja.web.BIFormFactorMax;
import javax.baja.web.js.BIJavaScript;
import javax.baja.web.js.JsInfo;
import javax.baja.webeditors.ux.BWebEditorsJsBuild;

@NiagaraSingleton
@NiagaraType(agent = @AgentOn(types = { "baja:Folder" }))
public class BFolderDashboard
  extends BSingleton
  implements BIJavaScript, BIFormFactorMax
{
//region /*+ ------------ BEGIN BAJA AUTO GENERATED CODE ------------ +*/
//@formatter:off
/*@ $com.demo.folderDashboard.ux.views.BFolderDashboard(2302133499)1.0$ @*/
/* Generated Wed Mar 11 14:36:56 IST 2026 by Slot-o-Matic (c) Tridium, Inc. 2012-2026 */

  public static final BFolderDashboard INSTANCE = new BFolderDashboard();

  //region Type

  @Override
  @Generated
  public Type getType() { return TYPE; }
  @Generated
  public static final Type TYPE = Sys.loadType(BFolderDashboard.class);

  //endregion Type

//@formatter:on
//endregion /*+ ------------ END BAJA AUTO GENERATED CODE -------------- +*/
  @Override
  public JsInfo getJsInfo(Context context)
  {
    return JS_INFO;
  }

  private static final JsInfo JS_INFO = JsInfo.make(BOrd.make("module://folderDashboard/rc/views/FolderDashboardView.js"));
}
