/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0, (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.tle.core.institution.convert;

import com.tle.beans.Institution;
import com.tle.common.filesystem.handle.TemporaryFileHandle;
import com.tle.core.institution.convert.service.InstitutionImportService.ConvertType;
import com.tle.core.institution.convert.service.impl.InstitutionImportServiceImpl.ConverterTasks;
import java.io.IOException;

public interface Converter {
  // Kept for deserialisation purposes.
  // Could write a custom XStream deserialiser for this instead.
  @Deprecated
  public enum ConverterId {
    ITEMS,
    USERS,
    ENTITIES,
    CONFIGURATION,
    FILES,
    GROUPS,
    HIERARCHY,
    TAXONOMIES,
    PREFERENCES,
    COURSES,
    LANGUAGES,
    ITEMSATTACHMENTS,
    ACLS,
    AUDITLOGS,
    MIGRATION,
    SYNCHRONIZEITEMS,
    CLEANUPFILES,
    ZIPFILES
  }

  void doInTransaction(Runnable runnable);

  void addTasks(ConvertType type, ConverterTasks tasks, ConverterParams params);

  void deleteIt(
      TemporaryFileHandle staging, Institution institution, ConverterParams params, String task);

  void clone(
      TemporaryFileHandle staging, Institution newInstitution, ConverterParams params, String task)
      throws IOException;

  void exportIt(
      TemporaryFileHandle staging, Institution institution, ConverterParams params, String cid)
      throws IOException;

  void importIt(
      TemporaryFileHandle staging, Institution newInstitution, ConverterParams params, String cid)
      throws IOException;
}
