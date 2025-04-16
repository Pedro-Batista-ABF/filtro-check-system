import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector, Service, Photo, SectorStatus, CycleOutcome } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type SectorFormValues } from '@/types/forms';

const formSchema = z.object({
  tagNumber: z.string().min(2, {
    message: "Número da TAG deve ter pelo menos 2 caracteres.",
  }),
  entryInvoice: z.string().min(2, {
    message: "NF de entrada deve ter pelo menos 2 caracteres.",
  }),
  entryDate: z.string().min(1, {
    message: "Data de entrada é obrigatória.",
  }),
  peritagemDate: z.string().optional(),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    selected: z.boolean(),
    quantity: z.number().optional(),
    observations: z.string().optional(),
  })),
  beforePhotos: z.array(z.object({
    id: z.string().optional(),
    url: z.string(),
    type: z.string(),
    serviceId: z.string().optional(),
  })),
  productionCompleted: z.boolean().default(false),
  status: z.enum(['peritagemPendente', 'emExecucao', 'checagemFinalPendente', 'concluido', 'sucateadoPendente', 'sucateado']),
  outcome: z.enum(['recovered', 'scrapped', 'redirected', 'EmAndamento']).optional(),
  entryObservations: z.string().optional(),
  exitDate: z.string().optional(),
  exitInvoice: z.string().optional(),
  checagemDate: z.string().optional(),
  exitObservations: z.string().optional(),
  scrapObservations: z.string().optional(),
  scrapValidated: z.boolean().optional(),
  scrapReturnDate: z.string().optional(),
  scrapReturnInvoice: z.string().optional(),
});

const SectorForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    addSector, 
    updateSector, 
    getSectorById, 
    isLoading, 
    error, 
    getDefaultServices 
  } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [date, setDate] = useState<Date>();
  const isEditing = !!id;

  const form = useForm<SectorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tagNumber: '',
      entryInvoice: '',
      entryDate: '',
      peritagemDate: '',
      services: [],
      beforePhotos: [],
      productionCompleted: false,
      status: 'peritagemPendente',
      outcome: 'EmAndamento',
      entryObservations: '',
      exitDate: '',
      exitInvoice: '',
      checagemDate: '',
      exitObservations: '',
      scrapObservations: '',
      scrapValidated: false,
      scrapReturnDate: '',
      scrapReturnInvoice: '',
    }
  });

  useEffect(() => {
    const loadSector = async () => {
      if (id) {
        const existingSector = await getSectorById(id);
        if (existingSector) {
          setSector(existingSector);
          form.reset({
            tagNumber: existingSector.tagNumber,
            entryInvoice: existingSector.entryInvoice,
            entryDate: existingSector.entryDate,
            peritagemDate: existingSector.peritagemDate || '',
            services: existingSector.services,
            beforePhotos: existingSector.beforePhotos,
            productionCompleted: existingSector.productionCompleted,
            status: existingSector.status,
            outcome: existingSector.outcome || 'EmAndamento',
            entryObservations: existingSector.entryObservations || '',
            exitDate: existingSector.exitDate || '',
            exitInvoice: existingSector.exitInvoice || '',
            checagemDate: existingSector.checagemDate || '',
            exitObservations: existingSector.exitObservations || '',
            scrapObservations: existingSector.scrapObservations || '',
            scrapValidated: existingSector.scrapValidated || false,
            scrapReturnDate: existingSector.scrapReturnDate || '',
            scrapReturnInvoice: existingSector.scrapReturnInvoice || '',
          });
        }
      } else {
        const defaultServices = await getDefaultServices();
        setServices(defaultServices);
        form.setValue("services", defaultServices);
      }
    };

    loadSector();
  }, [id, getSectorById, getDefaultServices, form]);

  const handleSubmit = async (data: SectorFormValues) => {
    try {
      // Map form data to Sector type
      const sectorData: Sector = {
        id: sector?.id || '',
        tagNumber: data.tagNumber,
        entryInvoice: data.entryInvoice,
        entryDate: data.entryDate,
        peritagemDate: data.peritagemDate,
        services: data.services,
        beforePhotos: data.beforePhotos,
        afterPhotos: [],
        scrapPhotos: [],
        productionCompleted: data.productionCompleted,
        status: data.status,
        outcome: data.outcome || 'EmAndamento',
        cycleCount: sector?.cycleCount || 1,
        entryObservations: data.entryObservations,
        exitDate: data.exitDate,
        exitInvoice: data.exitInvoice,
        checagemDate: data.checagemDate,
        exitObservations: data.exitObservations,
        scrapObservations: data.scrapObservations,
        scrapValidated: data.scrapValidated,
        scrapReturnDate: data.scrapReturnDate,
        scrapReturnInvoice: data.scrapReturnInvoice
      };

      if (isEditing && sector?.id) {
        await updateSector(sector.id, sectorData);
        navigate('/peritagem');
      } else {
        await addSector(sectorData);
        navigate('/peritagem');
      }
    } catch (error) {
      console.error("Erro ao salvar setor:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isEditing ? "Editar Setor" : "Novo Setor"}
          </CardTitle>
          <CardDescription className="text-center">
            Preencha os dados do setor para {isEditing ? "atualizar" : "cadastrar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tagNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da TAG</FormLabel>
                    <FormControl>
                      <Input placeholder="Número da TAG" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o número de identificação do setor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entryInvoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NF de Entrada</FormLabel>
                    <FormControl>
                      <Input placeholder="NF de Entrada" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número da nota fiscal de entrada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Entrada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value ? "text-muted-foreground" : ""
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => {
                            setDate(date)
                            field.onChange(date?.toISOString())
                          }}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data de entrada do setor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="peritagemDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Peritagem</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Data da Peritagem" {...field} />
                    </FormControl>
                    <FormDescription>
                      Data em que a peritagem foi realizada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviços</FormLabel>
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={field.value?.find((s: { id: string; }) => s.id === service.id)?.selected}
                          onCheckedChange={(checked) => {
                            const updatedServices = field.value.map((s: { id: string; selected: any; }) =>
                              s.id === service.id ? { ...s, selected: checked } : s
                            );
                            field.onChange(updatedServices);
                          }}
                        />
                        <Label htmlFor={`service-${service.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {service.name}
                        </Label>
                      </div>
                    ))}
                    <FormDescription>
                      Selecione os serviços a serem realizados.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productionCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Produção Completa</FormLabel>
                      <FormDescription>
                        Indica se a produção foi finalizada.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="peritagemPendente">Peritagem Pendente</SelectItem>
                        <SelectItem value="emExecucao">Em Execução</SelectItem>
                        <SelectItem value="checagemFinalPendente">Checagem Final Pendente</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="sucateadoPendente">Sucateado Pendente</SelectItem>
                        <SelectItem value="sucateado">Sucateado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o status atual do setor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um resultado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="recovered">Recuperado</SelectItem>
                        <SelectItem value="scrapped">Sucateado</SelectItem>
                        <SelectItem value="redirected">Redirecionado</SelectItem>
                        <SelectItem value="EmAndamento">Em Andamento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o resultado do ciclo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entryObservations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações de Entrada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações de Entrada"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Observações sobre a entrada do setor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Saída</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Data de Saída" {...field} />
                    </FormControl>
                    <FormDescription>
                      Data de saída do setor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exitInvoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NF de Saída</FormLabel>
                    <FormControl>
                      <Input placeholder="NF de Saída" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número da nota fiscal de saída.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checagemDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Checagem</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Data da Checagem" {...field} />
                    </FormControl>
                    <FormDescription>
                      Data em que a checagem foi realizada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exitObservations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações de Saída</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações de Saída"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Observações sobre a saída do setor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scrapObservations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações de Sucateamento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações de Sucateamento"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Observações sobre o sucateamento do setor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scrapValidated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Sucateamento Validado</FormLabel>
                      <FormDescription>
                        Indica se o sucateamento foi validado.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scrapReturnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Retorno de Sucata</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Data de Retorno de Sucata" {...field} />
                    </FormControl>
                    <FormDescription>
                      Data em que a sucata foi retornada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scrapReturnInvoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NF de Retorno de Sucata</FormLabel>
                    <FormControl>
                      <Input placeholder="NF de Retorno de Sucata" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número da nota fiscal de retorno de sucata.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorForm;
