/*
 * Copyright 2026 demo. All Rights Reserved.
 */

import com.tridium.gradle.plugins.bajadoc.task.Bajadoc
import com.tridium.gradle.plugins.grunt.task.GruntBuildTask
import com.tridium.gradle.plugins.module.util.ModulePart.RuntimeProfile.*

plugins {
  id("com.tridium.convention.convention-module")
  id("com.tridium.niagara-grunt")
  id("com.tridium.tridium-repositories")
}

description = "A dashboard to view points existing inside a folder"

moduleManifest {
  moduleName.set("folderDashboard")
  runtimeProfile.set(ux)
}

// See documentation at module://docDeveloper/doc/build.html#dependencies for the supported
// dependency types
dependencies {
  // NRE dependencies
  nre(":nre")

  // Niagara module dependencies
  api(":baja")
  api(":control-rt")
  api(":js-ux")
  api(":bajaui-ux")
  api(":bajaScript-ux")
  api(":web-rt")
  api(":webEditors-ux")

  // Test Niagara module dependencies
  moduleTestImplementation(":test-wb")
}

tasks.named<Jar>("jar") {
  from("src") {
    include("rc/")
  }
}

tasks.named<Jar>("moduleTestJar") {
  from("srcTest") {
    include("rc/**/*.*")
  }
}

tasks.named<GruntBuildTask>("gruntBuild") {
  tasks("babel:dist", "copy:dist", "requirejs")
}

tasks.named<Bajadoc>("bajadoc") {
  // Each of the packages you wish to include in your module's API documentation must be
  // enumerated below
  includePackage("com.demo.folderDashboard.ux")
}
