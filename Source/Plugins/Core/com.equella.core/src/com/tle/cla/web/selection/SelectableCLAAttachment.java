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

package com.tle.cla.web.selection;

import com.google.inject.Singleton;
import com.tle.beans.cla.CLAHolding;
import com.tle.beans.cla.CLAPortion;
import com.tle.beans.cla.CLASection;
import com.tle.cla.service.CLAService;
import com.tle.core.copyright.service.CopyrightService;
import com.tle.core.guice.Bind;
import com.tle.web.copyright.AbstractSelectableCopyrightAttachment;
import javax.inject.Inject;

@Bind
@Singleton
public class SelectableCLAAttachment
    extends AbstractSelectableCopyrightAttachment<CLAHolding, CLAPortion, CLASection> {

  @Inject private CLAService claService;

  @Override
  protected CopyrightService<CLAHolding, CLAPortion, CLASection> getCopyrightServiceImpl() {
    return claService;
  }
}
