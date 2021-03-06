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

package com.tle.core.settings.property.serialise;

import com.tle.common.settings.ConfigurationProperties;
import com.tle.core.settings.property.PropertyBeanFactory;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Map;

public class BeanPropertySerialiser extends PropertySerialiser {
  @Override
  public void query(Object object, Field field, Collection<String> queries)
      throws IllegalAccessException, InstantiationException {
    Class<?> type = field.getType();
    if (ConfigurationProperties.class.isAssignableFrom(type)) {
      ConfigurationProperties fobject = (ConfigurationProperties) field.get(object);
      if (fobject == null) {
        fobject = (ConfigurationProperties) type.newInstance();
        field.set(object, fobject);
      }
      queries.addAll(PropertyBeanFactory.getSelect(fobject));
    }
  }

  @Override
  public void load(Object object, Field field, Map<String, String> properties)
      throws IllegalAccessException, InstantiationException {
    Class<?> type = field.getType();
    if (ConfigurationProperties.class.isAssignableFrom(type)) {
      ConfigurationProperties fobject = (ConfigurationProperties) field.get(object);
      if (fobject == null) {
        fobject = (ConfigurationProperties) type.newInstance();
        field.set(object, fobject);
      }
      PropertyBeanFactory.load(fobject, properties);
    }
  }

  @Override
  public void save(Object object, Field field, Map<String, String> properties)
      throws IllegalAccessException {
    if (ConfigurationProperties.class.isAssignableFrom(field.getType())) {
      ConfigurationProperties fobject = (ConfigurationProperties) field.get(object);
      PropertyBeanFactory.save(fobject, properties);
    }
  }
}
