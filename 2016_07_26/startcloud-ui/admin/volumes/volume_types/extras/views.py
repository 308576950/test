# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _

from horizon import exceptions
from horizon import forms
from horizon import tables

from openstack_dashboard import api

from openstack_dashboard.dashboards.admin.volumes.volume_types.extras \
    import forms as project_forms
from openstack_dashboard.dashboards.admin.volumes.volume_types.extras \
    import tables as project_tables


class ExtraSpecMixin(object):
    def get_context_data(self, **kwargs):
        context = super(ExtraSpecMixin, self).get_context_data(**kwargs)
        try:
            context['vol_type'] = api.cinder.volume_type_get(self.request,
                                                    self.kwargs['type_id'])
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to retrieve volume type details."))
        if 'key' in self.kwargs:
            context['key'] = self.kwargs['key']
        return context


class IndexView(ExtraSpecMixin, forms.ModalFormMixin, tables.DataTableView):
    table_class = project_tables.ExtraSpecsTable
    template_name = 'admin/volumes/volume_types/extras/index.html'

    def get_data(self):
        try:
            type_id = self.kwargs['type_id']
            extras_list = api.cinder.volume_type_extra_get(self.request,
                                                           type_id)
            extras_list.sort(key=lambda es: (es.key,))
        except Exception:
            extras_list = []
            exceptions.handle(self.request,
                              _('Unable to retrieve extra spec list.'))
        return extras_list


class CreateView(ExtraSpecMixin, forms.ModalFormView):
    form_class = project_forms.CreateExtraSpec
    template_name = 'admin/volumes/volume_types/extras/create.html'

    def get_initial(self):
        return {'type_id': self.kwargs['type_id']}

    def get_success_url(self):
        return ("/admin/volumes/volume_types/%s/extras/" %
                (self.kwargs['type_id']))


class EditView(ExtraSpecMixin, forms.ModalFormView):
    form_class = project_forms.EditExtraSpec
    template_name = 'admin/volumes/volume_types/extras/edit.html'
    success_url = 'horizon:admin:volumes:volume_types:extras:index'

    def get_success_url(self):
        return reverse(self.success_url,
                       args=(self.kwargs['type_id'],))

    def get_initial(self):
        type_id = self.kwargs['type_id']
        key = self.kwargs['key']
        try:
            extra_specs = api.cinder.volume_type_extra_get(self.request,
                                                           type_id,
                                                           raw=True)
        except Exception:
            extra_specs = {}
            exceptions.handle(self.request,
                              _('Unable to retrieve volume type extra spec '
                                'details.'))
        return {'type_id': type_id,
                'key': key,
                'value': extra_specs.get(key, '')}