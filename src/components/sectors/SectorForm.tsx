import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import ServicesList from './ServicesList';
import {
  Service,
  ServiceType,
  Sector,
  SectorFormValues,
  CycleOutcome,
  Photo,
  ServicePhotoType
} from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { loadServicesOptimized } from '@/utils/serviceUtils';
import ErrorMessage from '../peritagem/ErrorMessage';
import PhotoUpload from './PhotoUpload';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do setor deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  cycle: z.enum(['interno', 'externo']),
  cycle_outcome: z.enum(['Aprovado', 'Reprovado', 'Garantia', 'Sucateado']).optional(),
  date: z.date().optional(),
  location: z.string().optional(),
  responsible: z.string().optional(),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    selected: z.boolean(),
    type: z.string(),
    photos: z.array(z.object({
      id: z.string(),
      url: z.string(),
      type: z.enum(['before', 'after']),
    })),
    quantity: z.number(),
    observation: z.string().optional(),
  })).optional(),
});

interface SectorFormProps {
  formType: 'create' | 'edit' | 'quality';
}

export default function SectorForm({ formType }: SectorFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sectorId, setSectorId] = useState(id || uuidv4());
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [photoRequired, setPhotoRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      cycle: 'interno',
      cycle_outcome: undefined,
      date: undefined,
      location: undefined,
      responsible: undefined,
      services: [],
    },
    mode: "onChange"
  });

  const { isLoading: isSectorLoading, data: sectorData } = useQuery({
    queryKey: ['sector', sectorId],
    queryFn: async () => {
      if (formType === 'create') return null;
      if (!sectorId) throw new Error("ID do setor não fornecido");

      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();

      if (error) {
        console.error("Erro ao carregar dados do setor:", error);
        throw new Error(`Erro ao carregar setor: ${error.message}`);
      }

      return data as Sector;
    },
    enabled: formType !== 'create' && !!sectorId,
    onError: (err: any) => {
      setError(err.message || 'Erro ao carregar dados do setor.');
    }
  });

  const { mutate: saveSector } = useMutation({
    mutationFn: async (data: SectorFormValues) => {
      if (!user) throw new Error("Usuário não autenticado");

      const sectorData = {
        ...data,
        id: sectorId,
        user_id: user.id,
      };

      const { data: responseData, error } = await supabase
        .from('sectors')
        .upsert([sectorData], { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar setor:", error);
        throw new Error(`Erro ao salvar setor: ${error.message}`);
      }

      return responseData as Sector;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast({
        title: "Sucesso",
        description: "Setor salvo com sucesso!",
      });
      navigate('/peritagem');
    },
    onError: (err: any) => {
      setError(err.message || 'Erro ao salvar o setor.');
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  useEffect(() => {
    const loadInitialServices = async () => {
      setLoadingServices(true);
      try {
        const loadedServices = await loadServicesOptimized();
        setServices(loadedServices);
        form.setValue("services", loadedServices);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar serviços.');
      } finally {
        setLoadingServices(false);
      }
    };

    loadInitialServices();
  }, []);

  useEffect(() => {
    if (sectorData) {
      form.reset({
        name: sectorData.name,
        description: sectorData.description,
        cycle: sectorData.cycle,
        cycle_outcome: sectorData.cycle_outcome,
        date: sectorData.date ? new Date(sectorData.date) : undefined,
        location: sectorData.location,
        responsible: sectorData.responsible,
        services: sectorData.services,
      });
      setServices(sectorData.services || []);
    }
  }, [sectorData, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    const outcome: CycleOutcome = "Sucateado"; // Use the correct enum value

    saveSector({
      ...values,
      id: sectorId,
      cycle_outcome: values.cycle_outcome || outcome,
      services: services
    });
  };

  const handleServiceSelect = (serviceId: string, selected: boolean) => {
    setServices(prevServices => {
      return prevServices.map(service => {
        if (service.id === serviceId) {
          return { ...service, selected: selected };
        }
        return service;
      });
    });
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    setServices(prevServices => {
      return prevServices.map(service => {
        if (service.id === serviceId) {
          return { ...service, quantity: quantity };
        }
        return service;
      });
    });
  };

  const handleObservationChange = (serviceId: string, observation: string) => {
    setServices(prevServices => {
      return prevServices.map(service => {
        if (service.id === serviceId) {
          return { ...service, observation: observation };
        }
        return service;
      });
    });
  };

  const handlePhotoUpload = async (
    serviceId: string,
    photoUrl: string,
    photoType: ServicePhotoType
  ) => {
    setServices(prevServices => {
      return prevServices.map(service => {
        if (service.id === serviceId) {
          const newPhoto: Photo = {
            id: uuidv4(),
            url: photoUrl,
            type: photoType,
          };
          return {
            ...service,
            photos: [...service.photos, newPhoto],
          };
        }
        return service;
      });
    });
  };

  const handleDeletePhoto = (serviceId: string, photoId: string) => {
    setServices(prevServices => {
      return prevServices.map(service => {
        if (service.id === serviceId) {
          return {
            ...service,
            photos: service.photos.filter(photo => photo.id !== photoId),
          };
        }
        return service;
      });
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{formType === 'create' ? 'Criar Setor' : formType === 'edit' ? 'Editar Setor' : 'Visualizar Setor'}</CardTitle>
        <CardDescription>Preencha os detalhes do setor.</CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorMessage message={error} />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Setor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} disabled={formType === 'quality'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição" {...field} disabled={formType === 'quality'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciclo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={formType === 'quality'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ciclo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="interno">Interno</SelectItem>
                        <SelectItem value="externo">Externo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("cycle") === "externo" && (
                <FormField
                  control={form.control}
                  name="cycle_outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado do Ciclo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={formType === 'quality'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o resultado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Aprovado">Aprovado</SelectItem>
                          <SelectItem value="Reprovado">Reprovado</SelectItem>
                          <SelectItem value="Garantia">Garantia</SelectItem>
                          <SelectItem value="Sucateado">Sucateado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={formType === 'quality'}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={formType === 'quality'}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Localização" {...field} disabled={formType === 'quality'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Responsável" {...field} disabled={formType === 'quality'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div>
              <div className="mb-4 flex items-center justify-between">
                <Label htmlFor="services">Serviços</Label>
                {formType !== 'quality' && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setPhotoRequired(!photoRequired)}>
                    {photoRequired ? 'Remover Foto Obrigatória' : 'Tornar Foto Obrigatória'}
                  </Button>
                )}
              </div>

              {services && services.length > 0 ? (
                <ServicesList
                  services={services}
                  error={error}
                  photoRequired={photoRequired}
                  onServiceChange={handleServiceSelect}
                  onQuantityChange={handleQuantityChange}
                  onObservationChange={handleObservationChange}
                  onPhotoUpload={handlePhotoUpload}
                  onDeletePhoto={handleDeletePhoto}
                  editMode={formType !== 'quality'}
                />
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum serviço selecionado</p>
              )}
            </div>

            {formType !== 'quality' && (
              <CardFooter className="justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </CardFooter>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
